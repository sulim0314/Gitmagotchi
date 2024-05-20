import pymysql
import boto3
import logging
import json

from pymysql.err import OperationalError

AWS_REGION_SEOUL = 'ap-northeast-2'  # 리전 정보

ssm = boto3.client('ssm', region_name=AWS_REGION_SEOUL)

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

def search_from_aurora(userId):
    conn = None
    try:
        conn = init_db()
        with conn.cursor() as cur:
            select_query = """
            SELECT b.id, b.image_url
            FROM user_background AS ub
            JOIN background AS b ON ub.background_id = b.id
            WHERE ub.user_id = %s;
            """
            cur.execute(select_query, (userId,))

            results = cur.fetchall()  # 여러 결과를 가져옵니다.
            backgrounds = [{'id': row[0], 'imageUrl': row[1]} for row in results]
            return backgrounds
        
    except Exception as e:
        raise Exception(f'Error occured on save... {e}')
    finally:
        if conn:
            conn.close()            

def lambda_handler(event, context):
    try:
        print("event : ", event)
        userId = event.get('context').get('username').replace('github_', '')

        if not userId:
            raise ValueError('Missing userId')
        
        backgrounds = search_from_aurora(userId)
        return {
            'statusCode': 200,
            'body': json.dumps({'backgrounds': backgrounds})
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
