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

def modify_character(characterId, name=None, faceUrl=None, characterUrl=None):    
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

    conn = init_db()    
    with conn.cursor() as cur:
        try:
            # 필드가 존재하는 경우에만 쿼리를 실행합니다.
            if fields_to_update:
                update_query = f"""
                UPDATE `character`
                SET {', '.join(fields_to_update)}
                WHERE id = %s;
                """
                values.append(characterId)  # 마지막에 WHERE 조건을 위한 id 값을 추가합니다.
                cur.execute(update_query, tuple(values))
            else:
                print("No fields to update.")
        except Exception as e:
            print(f"An error occurred: {e}")
    conn.commit()

def lambda_handler(event, context):    
    try:
        json_body = event.get('body')
        # event로부터 사용자 정보를 추출합니다.
        obj = json.loads(json_body)

        characterId = obj.get("characterId")
        name = obj.get("name")
        faceUrl = obj.get("faceUrl")
        characterUrl = obj.get("characterUrl")
        modify_character(characterId, name, faceUrl, characterUrl)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Character update successfully'})
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