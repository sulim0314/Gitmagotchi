import pymysql
import boto3
import json
from pymysql.err import OperationalError

ssm = boto3.client('ssm', region_name='ap-northeast-2')
db_name = "gitmagotchi"

def get_parameter(name):
    """Parameter Store로부터 파라미터 값을 가져오는 함수"""
    try:
        response = ssm.get_parameter(
            Name=name,
            WithDecryption=True
        )
        return response['Parameter']['Value']
    except ssm.exceptions.ParameterNotFound:
        raise ValueError(f"Parameter {name} not found")

def init_db(db_name):    
    try:
        # 환경 변수로부터 파라미터 이름을 읽어옵니다.
        db_host = get_parameter('mysql-host')
        db_user = get_parameter('mysql-username')
        db_password = get_parameter('mysql-password')
        
        # 데이터베이스에 연결
        return pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    except OperationalError as e:
        print(f"Database connection failed: {e}")
        raise ValueError("Failed to connect to the database")
    except ValueError as e:
        raise e

def get_character_motion(character_id, level):
    conn = init_db(db_name)
    sql = f"SELECT id, motion_url FROM {db_name}.motion WHERE character_id=%s and required_level=%s order by id desc limit 1;"
    response = None
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (str(character_id), str(level)))
            response = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    if response is None:
        return 404, None

    return 200, response[1]

def lambda_handler(event, context):
    character_id = event['characterId']
    level = event['requiredLevel']

    level = min(level, 9)
    status, url = get_character_motion(character_id, level)
    print(status, url)
    if status == 404:
        return {
            'statusCode': 404,
            'body': 'Motion is still being generated or has not reached the level.'
        }

    return {
        'statusCode': 200,
        'body': {
            'motionUrl': url
        }
    }

# if __name__ == "__main__":
#     lambda_handler(None, None)