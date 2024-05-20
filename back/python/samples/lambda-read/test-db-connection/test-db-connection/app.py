import pymysql
import boto3
import os

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
    # 환경 변수로부터 파라미터 이름을 읽어옵니다.
    db_host = get_parameter('mysql-host')
    db_user = get_parameter('mysql-username')
    db_password = get_parameter('mysql-password')
    db_name = "gitmagotchi"  # 데이터베이스 이름을 설정합니다.
    
    # 데이터베이스에 연결
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    
    try:
        with conn.cursor() as cur:
            # CRUD 작업 예시: SELECT
            cur.execute("SELECT * FROM user LIMIT 10;")
            for row in cur:
                print(row)
        conn.commit()
    finally:
        conn.close()

    return {
        'statusCode': 200,
        'body': 'Query executed successfully!'
    }
