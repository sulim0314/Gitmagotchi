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
    s3_client.put_object(Bucket=bucket_name, Key=file_name, Body=image_bytes, ContentType='image/png')
    url = f"https://{bucket_name}.s3.{AWS_REGION_VIRGINIA}.amazonaws.com/{file_name}"
    return url

def save_to_aurora(userId, nickname=None, profileImg=None):
    # 업데이트할 필드와 값의 리스트를 준비합니다.
    fields_to_update = []
    values = []
    if nickname is not None:
        fields_to_update.append("nickname = %s")
        values.append(nickname)
    if profileImg is not None:
        fields_to_update.append("profile_img = %s")
        values.append(profileImg)

    conn = None
    try:
        conn = init_db()
        with conn.cursor() as cur:
            update_query = f"""
            UPDATE user
            SET {', '.join(fields_to_update)}
            WHERE id = %s;
            """
            values.append(userId)  # 마지막에 WHERE 조건을 위한 id 값을 추가합니다.
            cur.execute(update_query, tuple(values))
           
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
        profileImg = obj.get("profileImg")
        nickname = obj.get("nickname")
        imageUrl = None

        if not userId:
            raise ValueError('Missing userId')
        elif not nickname and not profileImg:
            return {
                'statusCode': 204,
                'body': json.dumps({'message': 'No content to update'})
            }        

        if profileImg:
            encoded_img = profileImg.split(",")[1]
            image_bytes = base64.b64decode(encoded_img)    
            try:        
                # 생성된 이미지를 S3에 업로드하고 URL 받기
                file_name = f"profile-{uuid.uuid4()}.png"  # 유니크한 파일 이름 생성
                imageUrl = upload_to_s3(image_bytes, S3_BUCKET, file_name)        
            except (ClientError) as err:
                logging.error("Error uploading the image: %s", err)
                return {
                    'statusCode': 500,
                    'body': json.dumps({"error": str(err)})
                }      
        save_to_aurora(userId, nickname, imageUrl)
        userInfo = {
            'id': userId,
            'nickname': nickname,
            'profileImg': imageUrl
        }
        return {
            'statusCode': 200,
            'body': json.dumps(userInfo)
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
