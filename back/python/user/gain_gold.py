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

def gain_gold(user_id, gold):
    conn = init_db(db_name)
    sql = f"SELECT id, gold FROM {db_name}.user WHERE id={user_id};"
    response = None
    
    with conn.cursor() as cur:
        cur.execute(sql)
        response = cur.fetchone()
    conn.commit()
    
    # 사용자가 없을 때
    if response is None:
        return 404, {"msg": "Invalid userId"}
        
    updated_gold = 0
    if response[1] is not None:
        updated_gold += response[1]
    updated_gold += gold
    
    
    sql = f"UPDATE {db_name}.user SET gold={updated_gold} WHERE id={user_id}; "
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
    finally:
        conn.close()

    return 200, {"value": updated_gold}

def lambda_handler(event, context):
    user_id = event.get('userId')
    gold = event.get('value')
    if not user_id or not gold:
        return {
            'statusCode': 400,
            'body': {'msg': '요청형식을 확인하세요'}
        }
        
    code, body = gain_gold(user_id, gold)
    return {
        'statusCode': code,
        'body': body
    }