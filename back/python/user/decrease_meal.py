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
    """잔여 밥 부족으로 요청을 거부할 때 발생하는 예외"""
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

def save_to_aurora(userId):
    conn = None
    try:
        conn = init_db()
        with conn.cursor() as cur:
            select_query = """
            SELECT meal FROM user WHERE id = %s;
            """
            cur.execute(select_query, (userId,))
            meal = cur.fetchone()[0]
            if meal < 1:
                raise ForbiddenError('Not enough meal...')
            
            update_query = """
            UPDATE user
            SET meal = meal - 1
            WHERE id = %s;
            """            
            cur.execute(update_query, (userId,))
           
        conn.commit()
    except Exception as e:
        raise Exception(f'Error occured on save... {e}')
    finally:
        if conn:
            conn.close()
        return meal - 1

def lambda_handler(event, context):
    try:        
        userId = event.get('context').get('username').replace('github_', '')        

        if not userId:
            raise ValueError('Missing userId')
        meal = save_to_aurora(userId)
        userInfo = {
            'id': userId,
            'meal': meal
        }
        return {
            'statusCode': 200,
            'body': json.dumps(userInfo)
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
