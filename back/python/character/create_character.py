import pymysql
import boto3
import json
import logging
from pymysql.err import OperationalError

# AWS Systems Manager (SSM) 클라이언트 생성
ssm = boto3.client('ssm', region_name='ap-northeast-2')

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

def save_to_aurora(userId, name, faceUrl):
    conn = None
    try:
        conn = init_db()    
        with conn.cursor() as cur:        
            # 캐릭터 생성            
            insert_character_query = """
            INSERT INTO `character` (user_id, name, face_url)
            VALUES (%s, %s, %s);
            """
            cur.execute(insert_character_query, (userId, name, faceUrl))
            characterId = cur.lastrowid
            print("characterId : ", characterId)

            # 상태 생성
            insert_status_query = """
            INSERT INTO `status` (character_id, user_id)
            VALUES (%s, %s);
            """
            cur.execute(insert_status_query, (characterId, userId))

            # 능력치 생성
            insert_stat_query = """
            INSERT INTO `stat` (character_id, user_id)
            VALUES (%s, %s);
            """
            cur.execute(insert_stat_query, (characterId, userId))

            # 유저 테이블에 캐릭터 id 저장
            update_user_query = """
            UPDATE user
            SET character_id = %s
            WHERE id = %s;
            """
            cur.execute(update_user_query, (characterId, userId))
            conn.commit()

            return characterId
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
        name = obj.get("name")
        faceUrl = obj.get("faceUrl")
        
        if not userId:
            raise ValueError('Missing userId')
        elif not name or not faceUrl:
            raise ValueError('Missing required Parameter')

        characterId = save_to_aurora(userId, name, faceUrl)        
        return {
            'statusCode': 200,
            'body': json.dumps({"characterId": characterId}),
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
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }        