import pymysql
import boto3
import os
import json

# AWS Systems Manager (SSM) 클라이언트 생성
ssm = boto3.client('ssm', region_name='ap-northeast-2')

def get_parameter(name):
    """Parameter Store로부터 파라미터 값을 가져오는 함수"""
    response = ssm.get_parameter(
        Name=name,
        WithDecryption=True
    )
    return response['Parameter']['Value']

def lambda_handler(event, context):    
    json_body = event.get('body')

    # 환경 변수로부터 파라미터 이름을 읽어옵니다.
    db_host = get_parameter('mysql-host')
    db_user = get_parameter('mysql-username')
    db_password = get_parameter('mysql-password')
    db_name = "gitmagotchi"  # 데이터베이스 이름을 설정합니다.

    # event로부터 사용자 정보를 추출합니다.
    obj = json.loads(json_body)    
    
    userId = obj.get("userId")
    profileImg = obj.get("profileImg")
    nickname = obj.get("nickname")
    
    # 데이터베이스에 연결
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    
    try:
        with conn.cursor() as cur:
            update_query = """
            UPDATE user 
            SET profile_img = %s, nickname = %s
            WHERE id = %s;
            """
            cur.execute(update_query, (profileImg, nickname, userId))
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

    return {
        'statusCode': 200,
        'body': 'Query executed successfully!'
    }
