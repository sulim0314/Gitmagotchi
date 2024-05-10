import json
import logging
import boto3
import pymysql

from botocore.exceptions import ClientError

# 필요한 설정 값을 설정하세요
S3_BUCKET = 'gitmagotchi-generated'  # S3 버킷 이름
AWS_REGION_VIRGINIA = 'us-east-1'
AWS_REGION_SEOUL = 'ap-northeast-2'  # 리전 정보

s3_client = boto3.client('s3', region_name=AWS_REGION_VIRGINIA)
ssm_client = boto3.client('ssm', region_name=AWS_REGION_SEOUL)

def get_parameter(name):
    """Parameter Store로부터 파라미터 값을 가져오는 함수"""
    response = ssm_client.get_parameter(
        Name=name,
        WithDecryption=True
    )
    return response['Parameter']['Value']

def save_to_aurora(userId, backgroundId):
    # 환경 변수로부터 파라미터 이름을 읽어옵니다.
    db_host = get_parameter('mysql-host')
    db_user = get_parameter('mysql-username')
    db_password = get_parameter('mysql-password')
    db_name = "gitmagotchi"  # 데이터베이스 이름을 설정합니다.

    # 데이터베이스에 연결
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    
    try:
        with conn.cursor() as cur:
            # user_background 테이블에 데이터 삭제
            delete_user_background_query = """
            DELETE FROM user_background
            WHERE user_id=%s AND background_id=%s;
            """
            cur.execute(delete_user_background_query, (userId, backgroundId))
        conn.commit()
    except Exception as e:
        # 예외가 발생한 경우, 에러 메시지를 반환합니다.
        return {
            'statusCode': 400,
            'body': json.dumps(f"An error occurred: {str(e)}")
        }
    finally:
        # 데이터베이스 연결을 안전하게 종료합니다.
        conn.close()

def lambda_handler(event, context):
    json_body = event.get('body')
    
    print("Request:", event)
    print("Received body:", json_body)
    
    if not json_body:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid input data')
        }
        
    obj = json.loads(json_body)
    userId = obj.get("userId")
    backgroundId = obj.get("backgroundId")
    
    try:
        save_to_aurora(userId, backgroundId)
        return {
            'statusCode': 200,
            'body': 'Query executed successfully!'
        }

    except (ClientError) as err:
        logging.error("Error deleting background image: %s", err)
        return {
            'statusCode': 500,
            'body': json.dumps({"error": str(err)})
        }
