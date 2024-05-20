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

def search_by_id(characterId):
    conn = init_db()    
    with conn.cursor() as cur:
        try:            
            select_query = """
            SELECT ch.id, ch.user_id, ch.name, ch.exp, ch.face_url, 
                CASE
                    WHEN ch.exp >= 65 THEN ch.character_adult_url
                    ELSE ch.character_child_url
                END,
            s.fullness, s.intimacy, s.cleanness,
            t.fullness_stat, t.intimacy_stat, t.cleanness_stat, t.unused_stat
            FROM `character` AS ch
            JOIN status AS s ON ch.id = s.character_id
            JOIN stat AS t ON ch.id = t.character_id
            WHERE ch.id = %s AND ch.is_deleted = 0;
            """
            cur.execute(select_query, (characterId,))
            result = cur.fetchone()
            
            if not result:
                raise NotFoundException('Character not Found')
            
            return {
                'characterId': result[0],
                'userId': result[1],
                'name': result[2],
                'exp': result[3],
                'faceUrl': result[4],
                'characterUrl': result[5],
                'status': {
                    'fullness': result[6],
                    'intimacy': result[7],
                    'cleanness': result[8],
                },
                'stat':{                    
                    'fullnessStat': result[9],
                    'intimacyStat': result[10],
                    'cleannessStat': result[11],
                    'unusedStat': result[12]
                }
            }
        except Exception as e:
            raise Exception(f'Error occured on select by id... {e}')
        finally:
            conn.close()

def search_by_name(name, page, pageSize, orderBy):
    conn = init_db()    
    with conn.cursor() as cur:
        try:
            orderDir = 'ASC' if orderBy == 'OLDEST' else 'DESC'
            select_query = f"""
            SELECT id, user_id, name, exp,            
                CASE
                    WHEN exp >= 65 THEN character_adult_url
                    ELSE character_child_url
                END
            FROM `character`
            WHERE name like %s AND is_deleted = 0
            ORDER BY created_at {orderDir}
            LIMIT %s OFFSET %s;
            """
            searchPattern = f"%{name}%"
            limit = pageSize
            offset = (page - 1) * pageSize
            print(searchPattern, orderDir, limit, offset)
            cur.execute(select_query, (searchPattern, limit, offset))
            results = cur.fetchall()  # 여러 결과를 가져옵니다.
            return [{'id': row[0], 'userId': row[1], 'name': row[2], 'exp': row[3], 'characterUrl': row[4]} for row in results]
            
        except Exception as e:
            raise Exception(f'Error occured on select by name... {e}')
        finally:
            conn.close()

def lambda_handler(event, context):
    try:
        print("event:", event)
        # queryStringParameters에서 data 추출
        params = event.get('queryStringParameters', {})
        characterId = params.get('characterId')
        name = params.get('name')
        
        if not characterId and not name:
            raise ValueError('Missing required Parameter')
        
        result = None
        if characterId:
            result = search_by_id(characterId)
        elif name:
            page = int(params.get('page') or 1)
            pageSize = int(params.get('pageSize') or 12)
            orderBy = params.get('orderBy', 'LATEST')
            result = search_by_name(name, page, pageSize, orderBy)
        if result:
            return {
                'statusCode': 200,
                'body': json.dumps(result)
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
            'body': json.dumps({'error': 'Internal server error', 'detail': str(e)})
        }        