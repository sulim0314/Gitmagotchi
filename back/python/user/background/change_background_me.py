import pymysql
import boto3
import json
import logging

from pymysql.err import OperationalError

AWS_REGION_SEOUL = 'ap-northeast-2'  # 리전 정보
ssm = boto3.client('ssm', region_name=AWS_REGION_SEOUL)

class DatabaseConnectionError(Exception):
    """데이터베이스 연결 실패 시 발생하는 예외"""
    def __init__(self, message="Database connection failed"):
        self.message = message
        super().__init__(self.message)

def get_parameter(name):
    """Parameter Store로부터 파라미터 값을 가져오는 함수"""
    response = ssm.get_parameter(
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

def save_to_aurora(userId, backgroundId):
    conn = None    
    try:
        conn = init_db()    
        with conn.cursor() as cur:    
            update_query = """
            UPDATE user
            SET background_id = %s
            WHERE id = %s;
            """            
            cur.execute(update_query, (backgroundId, userId))

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
        backgroundId = obj.get("backgroundId")
        
        if not userId:
            raise ValueError('Missing userId')
        elif not backgroundId:
            raise ValueError('Missing backgroundId')
        
        save_to_aurora(userId, backgroundId)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Change background successfully'})
        }
    except DatabaseConnectionError as e:
        logging.error(f"DatabaseConnectionError: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Database connection error'})
        }
    except ValueError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }        