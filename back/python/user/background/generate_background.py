import uuid
import base64
import json
import logging
import boto3
import random
import pymysql

from botocore.exceptions import ClientError
from pymysql.err import OperationalError

# 필요한 설정 값을 설정하세요
S3_BUCKET = 'gitmagotchi-generated'  # S3 버킷 이름
AWS_REGION_VIRGINIA = 'us-east-1'
AWS_REGION_SEOUL = 'ap-northeast-2'  # 리전 정보
MODEL_ID = 'stability.stable-diffusion-xl-v1'

s3_client = boto3.client('s3', region_name=AWS_REGION_VIRGINIA)
ssm_client = boto3.client('ssm', region_name=AWS_REGION_SEOUL)
translate_clinet = boto3.client('translate', region_name=AWS_REGION_SEOUL)
bedrock_client = boto3.client(service_name='bedrock-runtime')

class ImageGenerationError(Exception):
    """Base class for exceptions in this module."""
    pass

class ImageError(ImageGenerationError):
    """Exception raised for errors during image generation."""
    def __init__(self, message="An error occurred during image generation"):
        self.message = message
        super().__init__(self.message)

class PolicyViolationError(ImageGenerationError):
    """Exception raised for policy violations."""
    def __init__(self, message="Your message violates the AI policy"):
        self.message = message
        super().__init__(self.message)

class ForbiddenError(Exception):
    """잔액 부족으로 요청을 거부할 때 발생하는 예외"""
    def __init__(self, message="Requested denied"):
        self.message = message
        super().__init__(self.message)

class DatabaseConnectionError(Exception):
    """데이터베이스 연결 실패 시 발생하는 예외"""
    def __init__(self, message="Database connection failed"):
        self.message = message
        super().__init__(self.message)

def get_parameter(name):
    """Parameter Store로부터 파라미터 값을 가져오는 함수"""
    response = ssm_client.get_parameter(
        Name=name,
        WithDecryption=True
    )
    return response['Parameter']['Value']

def init_db():    
    try:
        # 환경 변수로부터 파라미터 이름을 읽어옵니다.
        db_host = get_parameter('mysql-host')
        db_user = get_parameter('mysql-username')
        db_password = get_parameter('mysql-password')
        db_name = "gitmagotchi"
        
        # 데이터베이스에 연결
        return pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    except OperationalError as e:
        logging.error(f"Database connection failed: {e}")
        raise DatabaseConnectionError("Failed to connect to the database")

def upload_to_s3(image_bytes, bucket_name, file_name):
    """
    주어진 바이트 이미지를 S3 버킷에 업로드합니다.
    """
    s3_client.put_object(Bucket=bucket_name, Key=file_name, Body=image_bytes, ContentType='image/png')
    url = f"https://{bucket_name}.s3.{AWS_REGION_VIRGINIA}.amazonaws.com/{file_name}"
    return url

def get_gold_by_id(userId):
    conn = init_db()
    with conn.cursor() as cur:
        try:
            select_query = """
            SELECT gold FROM user WHERE id = %s;
            """
            cur.execute(select_query, (userId,))
            return cur.fetchone()[0]
        except Exception as e:
            raise Exception(f'Error occured on select... {e}')
        finally:
            conn.close()

def save_to_aurora(userId, image_url):
    conn = None    
    try:
        conn = init_db()
        with conn.cursor() as cur:
            # background 테이블에 데이터 삽입
            insert_background_query = """
            INSERT INTO background (image_url)
            VALUE (%s);
            """
            cur.execute(insert_background_query, (image_url,))
            backgroundId = cur.lastrowid
            print("background id : ", backgroundId)
            # user_background 테이블에 데이터 삽입
            insert_user_background_query = """
            INSERT INTO user_background (user_id, background_id)
            VALUES (%s, %s);
            """
            cur.execute(insert_user_background_query, (userId, backgroundId))
            # gold 사용
            update_query = """
            UPDATE user SET gold = gold - %s WHERE id = %s;
            """
            cur.execute(update_query, (100, userId))

        conn.commit()
    except Exception as e:
        raise Exception(f'Error occured on save... {e}')
    finally:
        if conn:
            conn.close()

def translate_user_input(userInput):
    source_language = 'auto'
    target_language = 'en'
    result = translate_clinet.translate_text(Text=userInput, SourceLanguageCode=source_language, TargetLanguageCode=target_language)
    print(f"{userInput} to {result}")
    return result.get('TranslatedText')

def generate_image(body):
    try:
        logging.info(f"Generating image with {MODEL_ID}")

        accept = "application/json"
        content_type = "application/json"
        response = bedrock_client.invoke_model(
            body=json.dumps(body), modelId=MODEL_ID, accept=accept, contentType=content_type
        )
        response_body = json.loads(response.get("body").read())    
            
        # 에러 관련 처리
        if response_body.get("error"):
            error_message = response_body["error"]
            if "policy violation" in error_message.lower():
                raise PolicyViolationError
            else:
                raise ImageError(f"Image generation error: {error_message}")

        base64_image = response_body["artifacts"][0]["base64"]
        base64_bytes = base64_image.encode('ascii')
        image_bytes = base64.b64decode(base64_bytes)

        logging.info(f"Successfully generated image with {MODEL_ID}")

        return image_bytes
    except PolicyViolationError as e:
        raise
    except ImageError as e:
        raise
    except Exception as e:
        raise

def weired_preprocess(userInput):
    dictionary = {
        'seas':'sea',
        'meadows':'grassland'
    }

    return dictionary.get(userInput, userInput)

def make_promt_body(userInput):
    prompt = translate_user_input(userInput)
    # basePrompt = "background_image, wallpaper, (picture_like_image), cute_game, high quality, cartoonish, view from the balcony"

    basePrompt = "high quality, view from the balcony, background, backdrop"
    negativePrompt = "people, (person), character, text, low_quality, object, cloudy, car, thing"
    seed = random.randint(400, 481)
    print(seed)
    return {
        "text_prompts": [
            {"text": prompt, "weight": 0.9},
            {"text": basePrompt, "weight": 0.4},
            {"text": negativePrompt, "weight": -0.9}
        ],                
        "height": 768,
        "width": 1024,
        "seed": seed,
        "cfg_scale": 35,
        "steps": 30,
        "style_preset": "photographic"
    }    

def lambda_handler(event, context):
    try:
        logging.info("event:", event)
        json_body = event.get('body').get('body')
        if not json_body:
            raise ValueError('Invalid input data')    
        
        obj = json.loads(json_body)
        userId = event.get('context').get('username').replace('github_', '')
        userInput = obj.get("userInput")   
        
        if not userId:
            raise ValueError('Missing userId')
        elif not userInput:
            raise ValueError('Missing userInput')
        
        gold = get_gold_by_id(userId)
        if gold < 100:
            raise ForbiddenError('Not enough gold...')     

        body = make_promt_body(userInput)                
    
        # 이미지 생성
        image_bytes = generate_image(body)
        
        try:
            # 생성된 이미지를 S3에 업로드하고 URL 받기
            file_name = f"image-{uuid.uuid4()}.png"  # 유니크한 파일 이름 생성
            image_url = upload_to_s3(image_bytes, S3_BUCKET, file_name)
        except (ClientError) as err:
                logging.error("Error uploading the image: %s", err)
                return {
                    'statusCode': 500,
                    'body': json.dumps({"error": str(err)})
                }
        
        save_to_aurora(userId, image_url)
        gold -= 100
        return {
            'statusCode': 200,
            'body': json.dumps({"imageUrl": image_url, "gold": gold}),
        }
    except PolicyViolationError as e:
        logging.error(f"PolicyViolationError: {e}")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }
    except ImageError as e:
        logging.error(f"ImageError: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    except ForbiddenError as e:
        logging.error(f"ForbiddenError: {e}")
        return {
            'statusCode': 403,
            'body': json.dumps({'error': str(e)})
        }   
    except DatabaseConnectionError as e:
        logging.error(f"DatabaseConnectionError: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Database connection error'})
        }
    except ValueError as e:
        logging.error(f"ValueError: {e}")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        logging.error(f"Internal server error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error', 'detail': str(e)})
        }  
