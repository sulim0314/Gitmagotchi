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

def update_stat(character_id, fullness, intimacy, cleanness):
    conn = init_db(db_name)
    
    # valid한지 확인
    sql = f"SELECT * FROM {db_name}.stat WHERE character_id=%s"
    response = None
    with conn.cursor() as cur:
        cur.execute(sql, (character_id))
        response = cur.fetchone()
    conn.commit()
    
    changed_pnt = 0
    unused_pnt = response[5]
    set_list = []
    body = {}
    if fullness: # response[2] 
        changed_pnt += (fullness - response[2])
        body["fullness"] = fullness
        set_list.append(f"fullness_stat={fullness}")
    else:
        body["fullness"] = response[2]

    if intimacy: # response[4]
        changed_pnt += (intimacy - response[3])
        body["intimacy"] = intimacy
        set_list.append(f"intimacy_stat={intimacy}")
    else:
        body["intimacy"] = response[3]

    if cleanness: # response[4]
        changed_pnt += (cleanness - response[4])
        body["cleanness"] = cleanness
        set_list.append(f"cleanness_stat={cleanness}")
    else:
        body["cleanness"] = response[4]
    
    print(unused_pnt)
    print(changed_pnt)
    if unused_pnt < changed_pnt:
        conn.close()
        return 400, {"msg": "스탯포인트가 부족합니다."}
    body["unusedStat"] = unused_pnt-changed_pnt
    
    # update
    set_list.append(f"unused_stat={body["unusedStat"]}")
    set_str = ", ".join(set_list)
    sql = f"UPDATE {db_name}.stat SET {set_str} WHERE character_id={character_id};"
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
    finally:
        conn.close()

    return 200, body


def lambda_handler(event, context):
    
    character_id = event.get('characterId')
    fullness = event.get('fullness')
    intimacy = event.get('intimacy')
    cleanness = event.get('cleanness')
    if not character_id:
        return {
            'statusCode': 400,
            'body': "Missing \'characterId\'"
        }
    
    code, body = update_stat(character_id, fullness, intimacy, cleanness)
    return {
        'statusCode': code,
        'body': body
    }
