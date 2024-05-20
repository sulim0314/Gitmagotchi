import boto3
import json
import logging
from pymysql.err import OperationalError, InternalError
import pymysql

ssm = boto3.client('ssm', region_name='ap-northeast-2')

class InsufficientStatsError(Exception):
    """변경할 스탯이 없을 때 발생하는 예외"""
    def __init__(self, message="No contents to update"):
        self.message = message
        super().__init__(self.message)

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

def save_to_aurora(userId):
    conn = None
    try:
        conn = init_db()
        with conn.cursor() as cur:
            # 캐릭터 id select
            select_query = """
            SELECT character_id FROM user WHERE id = %s;
            """
            cur.execute(select_query, (userId,))
            characterId = cur.fetchone()
            if not characterId:
                raise NotFoundException('Character not found...')
            
            # 총 스탯 select
            select_query = """
            SELECT fullness_stat, intimacy_stat, cleanness_stat, unused_stat
            FROM stat
            WHERE character_id = %s;
            """
            cur.execute(select_query, (characterId,))
            stats = cur.fetchone()
            if not stats:
                raise NotFoundException('Stats not found...')
            
            if stats[0] == 1 and stats[1] == 1 and stats[2] == 1:
                raise InsufficientStatsError('No stat to reset...')

            pnt = -3
            for stat in stats:
                pnt += stat

            # 스탯 초기화
            update_query = """
            UPDATE stat
            SET fullness_stat=1, intimacy_stat=1, cleanness_stat=1, unused_stat=%s
            WHERE character_id = %s;
            """
            cur.execute(update_query, (pnt, characterId))

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
    return pnt

def lambda_handler(event, context):
    try:
        userId = event.get('context').get('username').replace('github_', '')        
        if not userId:
            raise ValueError('Missing userId')
        print(userId)
        
        gold = get_gold_by_id(userId)
        print(gold)
        if gold < 100:
            raise ForbiddenError('Not enough gold...')
        
        pnt = save_to_aurora(userId)
        gold -= 100
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Stats reset successfully', "unusedStat": pnt, "gold": gold})
        }
    except InsufficientStatsError as e:
        logging.info(f"InsufficientStatsError: {e}")
        return {
            'statusCode': 204,
            'body': json.dumps({'message': str(e)})
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
