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

def search_my_info(userId):
    conn = init_db()
    with conn.cursor() as cur:
        try:
            select_user_query = """
            SELECT background_id, id, nickname, profile_img, gold, meal, character_id,
                   created_at, updated_at, last_time,
                   github_token, github_username
            FROM user
            WHERE id = %s AND is_deleted = 0;
            """
            cur.execute(select_user_query, (userId,))
            result = cur.fetchone()
            if not result:
                raise NotFoundException('Background not Found')
            backgroundId = result[0]

            # 유저가 소유한 배경화면이 맞는지 검사
            # select_user_background_query = """
            # SELECT * FROM user_background WHERE user_id = %s AND background_id = %s;
            # """
            # cur.execute(select_user_background_query, (userId, backgroundId))
            # if not cur.fetchone():
            #     raise NotFoundException('User-Background not Found')

            select_background_query = """
            SELECT image_url FROM background WHERE id = %s;
            """
            cur.execute(select_background_query, (backgroundId,))
            backgroundUrl = cur.fetchone()[0]

            if not backgroundUrl:
                raise NotFoundException('Image not Found')            
            return {
                'id': result[1],
                'nickname': result[2],                    
                'profileImg': result[3],
                'gold': result[4],
                'meal': result[5],
                'characterId': result[6],
                'backgroundUrl': backgroundUrl,
                'createdAt': result[7].isoformat(),
                'updatedAt': result[8].isoformat(),
                'lastTime': result[9].isoformat(),
                'githubToken': result[10],
                'githubUsername': result[11]
            }
        except Exception as e:
            raise Exception(f'Error occured on select... {e}')
        finally:
            conn.close()

def lambda_handler(event, context):
    try:
        userId = event.get('context').get('username').replace('github_', '')        
        if not userId:
            raise ValueError('Missing userId')
        userInfo = search_my_info(userId)

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
