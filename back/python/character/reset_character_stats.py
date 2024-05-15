import boto3
import json
from pymysql.err import OperationalError, InternalError
import pymysql


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

def reset_stat(character_id):
    conn = init_db(db_name)
    
    # valid한지 확인
    sql = f"SELECT * FROM {db_name}.stat WHERE character_id=%s"
    response = None
    with conn.cursor() as cur:
        cur.execute(sql, (character_id))
        response = cur.fetchone()
    conn.commit()
    
    # 캐릭터가 없는 경우
    if response[0] == '':
        conn.close()
        return 404, {"msg": "Invalid characterId"}
    
    pnt = 0
    for i in range(2, 6):
        pnt += response[i]

    # update
    set_str = f"fullness_stat=0, intimacy_stat=0, cleanness_stat=0, unused_stat={pnt}"
    sql = f"UPDATE {db_name}.stat SET {set_str} WHERE character_id={character_id};"
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
    finally:
        conn.close()
    return 200, {"msg": "success"}


def lambda_handler(event, context):
    
    character_id = event.get('characterId')
    if not character_id:
        return {
            'statusCode': 400,
            'body': "Missing \'characterId\'"
        }
    
    code, body = reset_stat(character_id)
    return {
        'statusCode': code,
        'body': body
    }
