from pathlib import Path
import logging
from urllib import request
import uuid

import cv2
from PIL import Image
from io import BytesIO
import numpy as np

import pymysql
import boto3
from botocore.exceptions import ClientError

import json


AWS_REGION = 'ap-northeast-2'
ssm = boto3.client('ssm', region_name=AWS_REGION)
s3 = boto3.client('s3', region_name=AWS_REGION)
sqs = boto3.client('sqs', region_name=AWS_REGION)
bucket_name = "gitmagotchi-character-basic-img"

NEW_CHARACTER_FILE_NAME = 'basic-img-'
NEW_CHARACTER_FILE_EXT = '.png'

def get_parameter(name):
    response = ssm.get_parameter(
            Name=name,
            WithDecryption=True)
    return response['Parameter']['Value']

db_host = get_parameter('mysql-host')
db_user = get_parameter('mysql-username')
db_password = get_parameter('mysql-password')
db_name = "gitmagotchi"


sqs = boto3.client('sqs', region_name=AWS_REGION)
default_url = "https://sqs.ap-northeast-2.amazonaws.com/992382698264/default-motion.fifo"
interaction_url = "https://sqs.ap-northeast-2.amazonaws.com/992382698264/interactioin-motion.fifo"
level_url = "https://sqs.ap-northeast-2.amazonaws.com/992382698264/level-motion.fifo"
'''
    [mysql] 얼굴 불러오기
'''
def load_generated_face(character_id: int):    
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    sql = f"SELECT * FROM {db_name}.character WHERE id=%s;"
    response = None
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (str(character_id)))
            response = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    if not response:
        return False, None

    return True, response[4]


'''
    [s3/mysql] 캐릭터 기본 이미지 저장
'''
def save(character_id: int, adult_or_child: str, img_file_name: str, img_bytes: bytearray):
    # s3에 저장
    try:
        s3.put_object(Bucket=bucket_name, Key=img_file_name, Body=img_bytes, ContentType='image/png')
        uploaded_url = f"https://{bucket_name}.s3.{AWS_REGION}.amazonaws.com/{img_file_name}"
    except ClientError as e:
        logging.error(e)
        return False

    # mysql에 저장
    # character_id = 2
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    sql = f"UPDATE {db_name}.character SET {adult_or_child}=%s WHERE id=%s;"
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (uploaded_url, str(character_id)))
        conn.commit()
    except ClientError as e:
        print(e)
        return False
    finally:
        conn.close()
    return True

def save_character_img(character_id: int, full_img: np, adult_or_child: str):
    buffered = BytesIO()
    full_img_pil = Image.fromarray(full_img[..., [2,1,0,3]].copy())
    full_img_pil.save(buffered, format="PNG")
    full_img_name = f"{NEW_CHARACTER_FILE_NAME}{str(uuid.uuid4())}"
    buffered.seek(0)    
    success = save(character_id, adult_or_child, full_img_name, buffered)
    return success

'''
    얼굴 합치기
'''
def merge_face_with_body(face_img_url:str, offset_face: list, adult_or_child: str):
    body_path = str(Path("./", f"{adult_or_child}_texture.png").resolve())
    texture = cv2.imread(body_path, cv2.IMREAD_UNCHANGED)
    face = Image.open(BytesIO(request.urlopen(face_img_url).read()))
    face = cv2.cvtColor(np.array(face), cv2.COLOR_RGBA2BGRA)

    # RGB인 경우, RGBA로 변환
    if face.shape[2] == 3:
        print("Invalid Format!")
        return

    def get_start_idx(face: np.ndarray):
        startIdx = np.argmax(face[:,:,-1])
        startIdx = np.unravel_index(startIdx, (face.shape[0], face.shape[1]))
        y = startIdx[0]

        startIdx = np.argmax(np.rot90(face[:,:,-1]))
        startIdx = np.unravel_index(startIdx, (face.shape[0], face.shape[1]))
        x = startIdx[0]-6
        return y, x

    # 붙일 얼굴 resize
    face_resized = cv2.resize(face, dsize=(0,0), fx=0.5, fy=0.5)

    # 붙일 얼굴 시작점 crop
    start_y, start_x = get_start_idx(face_resized)
    face_cropped = face_resized[start_y:,start_x:face_resized.shape[1]-50]

    # 붙일 얼굴 위치 지정
    face_moved = np.zeros(texture.shape)
    offset_l, offset_t = offset_face[0], offset_face[1]

    face_moved[offset_t:offset_t+face_cropped.shape[0], offset_l:offset_l+face_cropped.shape[1]] = face_cropped
    face_mask = face_moved[:,:,-1]
    texture[face_mask>0] = face_moved[face_mask>0]
    return texture


'''
    새 캐릭터 생성
'''
def make_new_template(character_id: int, face_url: str):
    adult_img = merge_face_with_body(face_url, [134,4], "adult")
    success = save_character_img(character_id, adult_img, "character_adult_url")
    if not success:
        return False

    child_img = merge_face_with_body(face_url, [71,4], "child")
    success = save_character_img(character_id, child_img, "character_child_url")
    if not success:
        return False
    
    return True


'''
    [mysql] user_id 가져오기
'''
def get_user_id(character_id):
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    sql = f"SELECT user_id FROM {db_name}.character WHERE id=%s"
    result = None
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (str(character_id)))
            result = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    if not result:
        return False, None
    return True, result[0]


'''
    [mysql] character에 해당 level의 모션이 존재하는지
'''
def check_motion(character_id: int, level: int):
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    sql = f"SELECT id, required_level, is_adult FROM {db_name}.motion WHERE character_id=%s"
    result = None
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (str(character_id)))
            result = cur.fetchmany(20)
        conn.commit()
    finally:
        conn.close()

    if not result:
        return None
    
    level_set = set()
    for _, l, a in result:
        level_set.add(str(l)+str(a))

    return level_set

def send_message(url,msg,level,adult_or_child, level_set):
    check_str = str(level)
    if adult_or_child == "child":
        check_str += str(0)
    else:
        check_str += str(1)

    if level_set and check_str in level_set:
        return

    msg["requiredLevel"] = level
    msg["adultOrChild"] = adult_or_child
    sqs.send_message(QueueUrl=url,
                MessageBody = json.dumps(msg),
                MessageGroupId = "motion"
            )


def handler(event, context):
    
    character_id = event["characterId"]
    level = event["requiredLevel"]
    
    # 레벨 1일 경우, 캐릭터 템플릿 생성
    if level==1:
        success, face_url = load_generated_face(character_id) # 얼굴 가져오기
        if not success:
            return {'statusCode': 404, 'body': json.dumps({"msg": "No Face!"})}

        success = make_new_template(character_id, face_url)          # 캐릭터 만들기
        if not success:
            return {'statusCode': 500, 'body': json.dumps({"msg": "Failed to make a new character"})}

    motion_key = 201
    
    if level > 9:
        return {'statusCode': 400, 'body': json.dumps({"msg":"Exceeded Maxium Level"})}
    
    success, user_id = get_user_id(character_id)
    if not success:
        return {'statusCode': 404, 'body': json.dumps({"msg":"Cannot find userId"})}
    
    msg = {}
    msg["characterId"] = character_id
    msg["userId"] = user_id
    if level == 1:
        # 아기버전
        motion_level = level + motion_key
        level_set = check_motion(character_id, motion_level)
        
        send_message(default_url, msg, 103, "child", level_set)
        send_message(default_url, msg, 104, "child", level_set)


        send_message(interaction_url, msg, 100, "child", level_set)
        send_message(interaction_url, msg, 101, "child", level_set)
        send_message(interaction_url, msg, 102, "child", level_set)
            
            
        send_message(level_url, msg, motion_level, "child", level_set)
        send_message(level_url, msg, motion_level,"adult", level_set)
        return  {'statusCode': 200, 'body': json.dumps({"msg":"Ready!"})}
    
    if level == 4:
        # 성인 버전
        motion_level = level + motion_key
        level_set = check_motion(character_id, motion_level)
            
        # 기본
        send_message(default_url, msg, 103, "adult", level_set)
        send_message(default_url, msg, 104, "adult", level_set)

        # 상호작용
        send_message(interaction_url,msg,100, "adult", level_set)
        send_message(interaction_url,msg,101, "adult", level_set)
        send_message(interaction_url,msg,102,"adult", level_set)
            
        # 레벨
        send_message(level_url, msg, motion_level, "adult", level_set)
        return  {'statusCode': 200, 'body': json.dumps({"msg":"Ready!"})}

    motion_level = level + motion_key
    level_set = check_motion(character_id, motion_level)
    
    if level < 5:
        send_message(level_url, msg, motion_level, "child", level_set)
    send_message(level_url, msg, motion_level, "adult", level_set)

    # 레벨별 모션 생성하기
    return {'statusCode': 200, 'body': json.dumps({"msg":"Ready!"})}
    

# if __name__ == "__main__":
#     handler(None, None)