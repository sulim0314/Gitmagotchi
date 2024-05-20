import uuid
import base64
import json
import logging
import boto3
import pymysql

from botocore.exceptions import ClientError
from pymysql.err import OperationalError

S3_BUCKET = 'gitmagotchi-generated'  # S3 버킷 이름
AWS_REGION_VIRGINIA = 'us-east-1'
AWS_REGION_SEOUL = 'ap-northeast-2'  # 리전 정보

s3_client = boto3.client('s3', region_name=AWS_REGION_VIRGINIA)
ssm_client = boto3.client('ssm', region_name=AWS_REGION_SEOUL)

class ForbiddenError(Exception):
    """잔액 부족으로 요청을 거부할 때 발생하는 예외"""
    def __init__(self, message="Requested denied"):
        self.message = message
        super().__init__(self.message)

class NotFoundException(Exception):
    """요청한 리소스를 찾을 수 없을 때 발생하는 예외"""
    def __init__(self, message="Requested resource not found"):
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
    try:
        s3_client.put_object(Bucket=bucket_name, Key=file_name, Body=image_bytes, ContentType='image/png')
        url = f"https://{bucket_name}.s3.{AWS_REGION_VIRGINIA}.amazonaws.com/{file_name}"
        return url
    except ClientError as e:
        logging.error(f"Error occurred on s3 uploading: {e}")
        raise

def get_gold_by_id(userId):
    conn = init_db()
    with conn.cursor() as cur:
        try:
            select_query = """
            SELECT gold FROM user WHERE id = %s;
            """
            cur.execute(select_query, (userId,))
            return cur.fetchone()
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
            cur.execute(update_query, (50, userId))

        conn.commit()
    except Exception as e:
        raise Exception(f'Error occured on save... {e}')
    finally:
        if conn:
            conn.close()

def lambda_handler(event, context):
    try:
        json_body = event.get('body').get('body')
        
        if not json_body:
            raise ValueError('Invalid input data')            
        obj = json.loads(json_body)
        
        userId = event.get('context').get('username').replace('github_', '')
        encoded_img = obj.get("backgroundImg").split(",")[1]

        if not userId:
            raise ValueError('Missing userId')
        elif not encoded_img:
            raise ValueError('Missing backgroundImg')

        gold = get_gold_by_id(userId)

        if gold < 50:
            raise ForbiddenError('Not enough gold...')

        image_bytes = base64.b64decode(encoded_img)
        
        # 생성된 이미지를 S3에 업로드하고 URL 받기
        file_name = f"image-{uuid.uuid4()}.png"  # 유니크한 파일 이름 생성
        image_url = upload_to_s3(image_bytes, S3_BUCKET, file_name)
        
        save_to_aurora(userId, image_url)
        gold -= 50
        return {
            'statusCode': 200,
            'body': json.dumps({"imageUrl": image_url, "gold": gold}),
        }
    except ForbiddenError as e:
        logging.error(f"ForbiddenError: {e}")
        return {
            'statusCode': 403,
            'body': json.dumps({'error': str(e)})
        }   
    except NotFoundException as e:
        logging.error(f"NotFoundException: {e}")
        return {
            'statusCode': 404,
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
