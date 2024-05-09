import uuid
import base64
import json
import logging
import boto3
import random
import pymysql

from botocore.exceptions import ClientError

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

def upload_to_s3(image_bytes, bucket_name, file_name):
    """
    주어진 바이트 이미지를 S3 버킷에 업로드합니다.
    """
    try:
        s3_client.put_object(Bucket=bucket_name, Key=file_name, Body=image_bytes, ContentType='image/png')
        url = f"https://{bucket_name}.s3.{AWS_REGION_VIRGINIA}.amazonaws.com/{file_name}"
        return url
    except ClientError as e:
        logging.error(e)
        return None

def save_to_aurora(userId, image_url):
    # 환경 변수로부터 파라미터 이름을 읽어옵니다.
    db_host = get_parameter('mysql-host')
    db_user = get_parameter('mysql-username')
    db_password = get_parameter('mysql-password')
    db_name = "gitmagotchi"  # 데이터베이스 이름을 설정합니다.

    # 데이터베이스에 연결
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    
    try:
        with conn.cursor() as cur:
            # background 테이블에 데이터 삽입
            insert_background_query = """
            INSERT INTO background (image_url)
            VALUE (%s);
            """
            cur.execute(insert_background_query, (image_url,))
            backgroundId = cur.lastrowid
            # user_background 테이블에 데이터 삽입
            insert_user_background_query = """
            INSERT INTO user_background (user_id, background_id)
            VALUES (%s, %s);
            """
            cur.execute(insert_user_background_query, (userId, backgroundId))

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
    
    if not json_body:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid input data')
        }
        
    obj = json.loads(json_body)    
    userId = obj.get("userId")
    encoded_img = obj.get("backgroundImg").split(",")[1]

    image_bytes = base64.b64decode(encoded_img)

    try:        
        # 생성된 이미지를 S3에 업로드하고 URL 받기
        file_name = f"image-{uuid.uuid4()}.png"  # 유니크한 파일 이름 생성
        image_url = upload_to_s3(image_bytes, S3_BUCKET, file_name)
        
        # S3 URL 리턴
        if image_url:
            save_to_aurora(userId, image_url)
            return {
                'statusCode': 200,
                'body': json.dumps({"imageUrl": image_url}),
            }
        else:
            return {
                'statusCode': 500,
                'body': json.dumps({"error": "Failed to upload image to S3"}),
            }

    except (ClientError) as err:
        logging.error("Error uploading the image: %s", err)
        return {
            'statusCode': 500,
            'body': json.dumps({"error": str(err)})
        }
