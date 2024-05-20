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

def reflect_status(userId):
    conn = None
    try:
        with conn.cursor() as cur:
            conn = init_db()    
            # 캐릭터 Id 찾기
            select_character_id_query = """
            SELECT character_id FROM user WHERE id = %s;
            """
            cur.execute(select_character_id_query, (userId,))            
            characterId = cur.fetchone()

            if not characterId:
                raise NotFoundException('Character not Found')

            select_query = """
            SELECT c.last_online, s.cleanness_stat
            FROM `character` c
            JOIN stat s ON c.id = s.character_id
            WHERE c.id = %s
            """
            cur.execute(select_query, (characterId,))
            result = cur.fetchone()

            if not result:
                raise NotFoundException('Factor not Found')
            
            lastOnline, cleannessStat = result

            update_query = """
            UPDATE `status`
            SET
                fullness = fullness - FLOOR(TIMESTAMPDIFF(HOUR, %s, NOW()) / 2),
                intimacy = intimacy - FLOOR(TIMESTAMPDIFF(HOUR, %s, NOW()) / 2),
                cleanness = cleanness - FLOOR(TIMESTAMPDIFF(HOUR, %s, NOW()) / (%s + 1))
            WHERE character_id = %s AND TIMESTAMPDIFF(HOUR, %s, NOW()) >= 2;
            """
            cur.execute(update_query, (lastOnline, lastOnline, lastOnline, cleannessStat, characterId, lastOnline))        
        conn.commit()
    except Exception as e:
        raise Exception(f'Error occured on save... {e}')
    finally:
        if conn:
            conn.close()

def lambda_handler(event, context):    
    try:
        userId = event.get('context').get('username').replace('github_', '')
        if not userId:
            raise ValueError('Missing userId')
        reflect_status(userId)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Character reflect successfully'})
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