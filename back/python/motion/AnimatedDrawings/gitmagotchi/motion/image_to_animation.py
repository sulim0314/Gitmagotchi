# Copyright (c) Meta Platforms, Inc. and affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import uuid
import logging
import yaml

from gitmagotchi.motion.annotations_to_animation import annotations_to_animation

import uuid
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
from urllib import request

MOTION_FILE_NAME = 'motion-'


import pymysql
import boto3
from botocore.exceptions import ClientError

AWS_REGION = 'ap-northeast-2'
# S3 설정
s3 = boto3.client('s3', region_name=AWS_REGION)
bucket_name = "gitmagotchi-motion"

# MySQL 설정
ssm = boto3.client('ssm', region_name=AWS_REGION)
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
    [s3/mysql] motion sprite 이미지 저장
'''
def save_motion(character_id: int, adult_or_child: str, user_id: int, required_level: int, frames: int, img_file_name: str, img_bytes: bytearray):
    
    # mysql 모션 저장
    is_adult = 1
    if adult_or_child == 'child':
        is_adult = 0

    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    # character에 해당 level의 모션이 존재하는지
    sql = f"SELECT id, required_level, is_adult, motion_url FROM {db_name}.motion WHERE character_id=%s and required_level=%s and is_adult=%s"
    result = None
    with conn.cursor() as cur:
        cur.execute(sql, (str(character_id), str(required_level), str(is_adult)))
        result = cur.fetchone()
    conn.commit()

    if result:
        conn.close()
        return True, result[3]

    # s3 모션 저장
    uploaded_url = None
    try:
        s3.put_object(Bucket=bucket_name, Key=img_file_name, Body=img_bytes, ContentType='image/png')
        uploaded_url = f"https://{bucket_name}.s3.{AWS_REGION}.amazonaws.com/{img_file_name}"
    except ClientError as e:
        logging.error(e)
        return False, None

    sql = f"INSERT INTO {db_name}.motion (user_id, character_id, motion_url, required_level, is_adult, frames) VALUES (%s, %s, %s, %s, %s, %s)"    
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (user_id, character_id, uploaded_url, required_level, is_adult, frames))
        conn.commit()
    except ClientError as e:
        logging.error(e)
        return False, None
    finally:
        conn.close()
    return True, uploaded_url

'''
    [mysql] character 이미지 user asset 디렉토리에 저장
'''
def load_character_img(usr_assets_dir: str, character_id: int, column_name: str):
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    sql = f"SELECT character_{column_name}_url FROM {db_name}.character WHERE id=%s"
    url = None
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (str(character_id)))
            url = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    character_img = Image.open(BytesIO(request.urlopen(url).read()))
    character_img = cv2.cvtColor(np.array(character_img), cv2.COLOR_RGBA2BGRA)

    path = str(Path(usr_assets_dir, 'texture.png').resolve())
    cv2.imwrite(path, character_img)
    
'''
    모션 부여
'''
def image_to_animation(character_id: int, user_id: int, adult_or_child:str, level: int, char_anno_dir: str, usr_assets_dir:str, motion_cfg_fn: str, retarget_cfg_fn: str):
    
    # 캐릭터 이미지 user asset 디렉토리에 저장
    character_img_path = Path(usr_assets_dir) / "texture.png"
    if not character_img_path.exists():
        load_character_img(usr_assets_dir, character_id, adult_or_child)
    
    # 모션 부여
    annotations_to_animation(char_anno_dir, usr_assets_dir, motion_cfg_fn, retarget_cfg_fn)

    # 프레임
    motion_cfg = {}
    with open(motion_cfg_fn, 'r') as f:
       motion_cfg = yaml.load(f, Loader=yaml.FullLoader)

    start_frame_idx =  motion_cfg["start_frame_idx"]
    end_frame_idx = motion_cfg["end_frame_idx"]
    frames = end_frame_idx - start_frame_idx

    # 이미지
    img_file_name = f"{MOTION_FILE_NAME}{str(uuid.uuid4())}"
    output_path =  str(Path(usr_assets_dir, "sprite-sheet.png").resolve())
    output_img = cv2.imread(output_path, cv2.IMREAD_UNCHANGED)
    buffered = BytesIO()
    output_img_pil = Image.fromarray(output_img[..., [2,1,0,3]].copy())
    output_img_pil.save(buffered, format="PNG")
    buffered.seek(0)

    success, url =  save_motion(character_id, adult_or_child, user_id, level, frames, img_file_name, buffered)
    success = True
    url = None
    return success, url
