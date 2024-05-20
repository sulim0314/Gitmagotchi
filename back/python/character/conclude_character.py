import pymysql
import boto3
import json
import logging
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

def save_to_aurora(userId, endingType):
    conn = None
    try:
        conn = init_db()    
        with conn.cursor() as cur:        
            # 캐릭터 Id 찾기
            select_query = """
            SELECT character_id, background_id FROM user WHERE id = %s;
            """
            cur.execute(select_query, (userId,))            
            characterId, backgroundId = cur.fetchone()

            if not characterId:
                raise NotFoundException('Character not Found')
            if not backgroundId:
                raise NotFoundException('Background not Found')
            
            # 컬렉션에 저장
            insert_query = """
            INSERT INTO collection 
            (character_name, character_url, user_id, fullness_stat, intimacy_stat, cleanness_stat, ending, created_at, background_url)
            SELECT c.name, 
                    CASE
                        WHEN c.exp >= 65 THEN c.character_adult_url
                        ELSE c.character_child_url
                    END,
                    c.user_id, s.fullness_stat, s.intimacy_stat, s.cleanness_stat, %s, NOW(), 
                    (SELECT image_url FROM background WHERE id = %s)
            FROM `character` c
            JOIN stat s ON c.id = s.character_id
            WHERE c.id = %s;
            """
            cur.execute(insert_query, (endingType, backgroundId, characterId))

            # 캐릭터 테이블에서 soft delete
            delete_query = """
            UPDATE `character`
            SET is_deleted = 1
            WHERE id = %s;
            """
            cur.execute(delete_query, (characterId,))

            # 유저 테이블에서 null로 변경
            fields_to_update = []
            if endingType == 'INDEPENDENT': # 졸업한 경우 gold 획득
                fields_to_update.append("gold = gold + 1000")
            fields_to_update.append("character_id = null")

            update_query = f"""
            UPDATE user
            SET {', '.join(fields_to_update)}
            WHERE id = %s;
            """
            cur.execute(update_query, (userId,))
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
        endingType = obj.get("endingType")
        
        if not userId:
            raise ValueError('Missing userId')
        elif not endingType:
            raise ValueError('Missing endingType')

        save_to_aurora(userId, endingType)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Character conclude successfully'})
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