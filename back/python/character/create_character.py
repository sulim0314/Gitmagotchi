import pymysql
import boto3
import json
from pymysql.err import OperationalError

# AWS Systems Manager (SSM) 클라이언트 생성
ssm = boto3.client('ssm', region_name='ap-northeast-2')

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
        print(f"Database connection failed: {e}")
        raise ValueError("Failed to connect to the database")
    except ValueError as e:
        raise e

def create_character(userId, name, faceUrl):
    if not name or not faceUrl:
        raise ValueError("Name and faceUrl are required")
    conn = init_db()    
    with conn.cursor() as cur:
        try:
            # 캐릭터 생성            
            insert_character_query = """
            INSERT INTO `character` (user_id, name, face_url)
            VALUES (%s, %s, %s);
            """
            cur.execute(insert_character_query, (userId, name, faceUrl))
            characterId = cur.lastrowid
            print("characterId : ", characterId)

            # 상태 생성
            insert_status_query = """
            INSERT INTO `status` (character_id, user_id, fullness, intimacy, cleanness)
            VALUES (%s, %s, %s, %s, %s);
            """
            cur.execute(insert_status_query, (characterId, userId, 100, 100, 100))

            # 능력치 생성
            insert_stat_query = """
            INSERT INTO `stat` (character_id, user_id, fullness_stat, intimacy_stat, cleanness_stat, unused_stat)
            VALUES (%s, %s, %s, %s, %s, %s);
            """
            cur.execute(insert_stat_query, (characterId, userId, 1, 1, 1, 0))

        except Exception as e:
            print(f"An error occurred: {e}")
    conn.commit()

def lambda_handler(event, context):    
    try:
        json_body = event.get('body')
        # event로부터 사용자 정보를 추출합니다.
        obj = json.loads(json_body)

        userId = obj.get("userId")
        name = obj.get("name")
        faceUrl = obj.get("faceUrl")
        create_character(userId, name, faceUrl)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Character created successfully'})
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