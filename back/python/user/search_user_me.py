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
    print("event : ", event)
    # queryStringParameters에서 userId 추출
    userId = event.get('queryStringParameters', {}).get('userId')

    if not userId:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing userId'})
        }

    # 환경 변수로부터 파라미터 이름을 읽어옵니다.
    db_host = get_parameter('mysql-host')
    db_user = get_parameter('mysql-username')
    db_password = get_parameter('mysql-password')
    db_name = "gitmagotchi"  # 데이터베이스 이름을 설정합니다.
    
    # 데이터베이스에 연결
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    
    try:
        with conn.cursor() as cur:
            select_query = """
            SELECT profile_img, nickname, gold, meal
            FROM user
            WHERE id = %s;
            """
            cur.execute(select_query, (userId,))
            result = cur.fetchone()

            if result:
                user_info = {
                    'profileImg': result[0],
                    'nickname': result[1],
                    'gold': result[2],
                    'meal': result[3]
                }
                return {
                    'statusCode': 200,
                    'body': json.dumps(user_info)
                }
            else:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'error': 'User not found'})
                }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        # 데이터베이스 연결을 안전하게 종료합니다.
        conn.close()
