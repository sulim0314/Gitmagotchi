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

AWS_REGION = 'ap-northeast-2'
ssm = boto3.client('ssm', region_name=AWS_REGION)
s3 = boto3.client('s3', region_name=AWS_REGION)
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

'''
    [mysql] 얼굴 불러오기
'''
def load_generated_face(character_id: int):    
    # character_id = 2
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
    return response


def save_character_img(character_id: int, full_img: np, adult_or_child: str):
    buffered = BytesIO()
    full_img_pil = Image.fromarray(full_img[..., [2,1,0,3]].copy())
    full_img_pil.save(buffered, format="PNG")
    full_img_name = f"{NEW_CHARACTER_FILE_NAME}{str(uuid.uuid4())}"
    buffered.seek(0)    
    success = save(character_id, adult_or_child, full_img_name, buffered)
    return success

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

'''
    얼굴 합치기
'''
def merge_face_with_body(char_anno_dir: str, usr_assets_dir: str, face_img_url:str, pos_face: list, offset_face: list):
    body_template_path = str(Path(char_anno_dir, "texture.png").resolve())
    mask_template_path = str(Path(char_anno_dir, "face-mask.png").resolve())
    body_path = str(Path(usr_assets_dir, "texture.png").resolve())
    
    full_img = cv2.imread(body_template_path, cv2.IMREAD_UNCHANGED)
    mask = np.array(cv2.imread(mask_template_path, cv2.IMREAD_UNCHANGED))
    face_img = Image.open(BytesIO(request.urlopen(face_img_url).read()))
    face_img = cv2.cvtColor(np.array(face_img), cv2.COLOR_RGBA2BGRA)

    # RGB -> RGBA로 변환
    if face_img.shape[2] == 3:
        alpha_channel = np.ones((face_img.shape[0], face_img.shape[1]), dtype=np.uint8) * 255
        face_img = cv2.merge((face_img, alpha_channel))

    # 얼굴 이미지 자르기
    b,t,l,r=758,185,222,734
    length_x, length_y = 254, 282
    face_img_cropped = face_img[t:b, l:r]
    face_img_resized = cv2.resize(face_img_cropped, (length_x, length_y))

    # 얼굴 이미지 몸 위치로 이동
    face_img_moved = np.array(Image.new("RGBA", (pos_face[1], pos_face[0]), (255,255,255,255)))
    offset_t, offset_l = offset_face[0], offset_face[1]
    face_img_moved[offset_t:offset_t+length_y, offset_l:offset_l+length_x] = face_img_resized
    
    # 몸 + 얼굴 이미지
    full_img[mask > 0] = face_img_moved[mask > 0]
    
    # 확인
    # cv2.imshow("Image", full_img)
    # cv2.waitKey(0)
    cv2.imwrite(body_path, full_img)
    return full_img

'''
    새 캐릭터 생성
'''
def make_new_character(character_id: int, level: int, char_anno_dir: str, usr_assets_dir: str):
    # mysql에 접근해서 얼굴을 가지고 온다.
    response = load_generated_face(character_id)
    if response is None or response[4] is None:
        return False, None
    if level > 1:
        return True, response[1]
    user_id = response[1]
    face_img_url = response[4]
    
    # path 정리
    # face_path = str(Path(usr_assets_dir, "image-face-template.png"))
    # face_img = cv2.imread(face_path, cv2.IMREAD_UNCHANGED)

    adult_anno_dir = Path(char_anno_dir, "adult")
    child_anno_dir = Path(char_anno_dir, "child")
    adult_usr_dir = Path(usr_assets_dir, "adult")
    child_usr_dir = Path(usr_assets_dir, "child")
    
    adult_img = merge_face_with_body(adult_anno_dir, adult_usr_dir, face_img_url, [798-112, 782-208], [6,138])
    child_img = merge_face_with_body(child_anno_dir, child_usr_dir, face_img_url, [496, 419], [6,75])

    # s3 & mysql 저장
    success = save_character_img(character_id, adult_img, "character_adult_url")
    if not success:
        return False, None
    
    success = save_character_img(character_id, child_img, "character_child_url")
    if not success:
        return False, None
    return True, user_id
