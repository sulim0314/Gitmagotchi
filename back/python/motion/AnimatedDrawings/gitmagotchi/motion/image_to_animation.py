# Copyright (c) Meta Platforms, Inc. and affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import uuid
import logging

from gitmagotchi.motion.annotations_to_animation import annotations_to_animation

import uuid
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from io import BytesIO

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
def save_motion(character_id: int, user_id: int, required_level: int, img_file_name: str, img_bytes: bytearray):
    # s3 모션 저장
    uploaded_url = None
    try:
        s3.put_object(Bucket=bucket_name, Key=img_file_name, Body=img_bytes, ContentType='image/png')
        uploaded_url = f"https://{bucket_name}.s3.{AWS_REGION}.amazonaws.com/{img_file_name}"
    except ClientError as e:
        logging.error(e)
        return False, None

    # mysql 모션 저장
    conn = pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    sql = f"INSERT INTO {db_name}.motion (user_id, character_id, motion_url, required_level) VALUES (%s, %s, %s, %s)"
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (user_id, character_id, uploaded_url, required_level))
        conn.commit()
    except ClientError as e:
        logging.error(e)
        return False, None
    finally:
        conn.close()
    return True, uploaded_url


'''
    모션 부여
'''
def image_to_animation(character_id: int, user_id: int, level: int, char_anno_dir: str, usr_assets_dir:str, motion_cfg_fn: str, retarget_cfg_fn: str):
    # 모션 부여
    annotations_to_animation(char_anno_dir, usr_assets_dir, motion_cfg_fn, retarget_cfg_fn)

    # 저장
    img_file_name = f"{MOTION_FILE_NAME}{str(uuid.uuid4())}"
    output_path =  str(Path(usr_assets_dir, "sprite-sheet.png").resolve())
    output_img = cv2.imread(output_path, cv2.IMREAD_UNCHANGED)
    buffered = BytesIO()
    output_img_pil = Image.fromarray(output_img[..., [2,1,0,3]].copy())
    output_img_pil.save(buffered, format="PNG")
    buffered.seek(0)

    success, url =  save_motion(character_id, user_id, level, img_file_name, buffered)
    return success, url
