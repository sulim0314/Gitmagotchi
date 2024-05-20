import pymysql
import boto3
import json
import logging
from pymysql.err import OperationalError

# AWS Systems Manager (SSM) 클라이언트 생성
ssm = boto3.client('ssm', region_name='ap-northeast-2')

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

def save_to_aurora(userId, name=None, faceUrl=None, characterUrl=None):    
    # 업데이트할 필드와 값의 리스트를 준비합니다.
    fields_to_update = []
    values = []
    if name is not None:
        fields_to_update.append("name = %s")
        values.append(name)
    if faceUrl is not None:
        fields_to_update.append("face_url = %s")
        values.append(faceUrl)
    if characterUrl is not None:
        fields_to_update.append("character_url = %s")
        values.append(characterUrl)
    fields_to_update.append("updated_at = NOW()")

    conn = None
    try:
        conn = init_db()    
        with conn.cursor() as cur:
            update_query = f"""
            UPDATE `character`
            SET {', '.join(fields_to_update)}
            WHERE id = (SELECT character_id FROM user WHERE id = %s);
            """
            values.append(userId)  # 마지막에 WHERE 조건을 위한 id 값을 추가합니다.
            cur.execute(update_query, tuple(values))

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

def lambda_handler(event, context):    
    try:
        json_body = event.get('body').get('body')
        
        if not json_body:
            raise ValueError('Invalid input data')
        obj = json.loads(json_body)    

        userId = event.get('context').get('username').replace('github_', '')        
        name = obj.get("name")
        faceUrl = obj.get("faceUrl")
        characterUrl = obj.get("characterUrl")

        gold = get_gold_by_id(userId)
        if gold < 100:
            raise ForbiddenError('Not enough gold...')

        if not userId:
            raise ValueError('Missing userId')
        elif not name and not faceUrl and not characterUrl:
            return {
                'statusCode': 204,
                'body': json.dumps({'message': 'No content to update'})
            }

        save_to_aurora(userId, name, faceUrl, characterUrl)
        gold -= 100
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Character update successfully', "gold": gold})
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