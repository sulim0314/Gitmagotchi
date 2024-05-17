
from gitmagotchi.motion.image_to_animation import image_to_animation
from pathlib import Path
import os
import json
import logging

motion_name_by_lv = dict()

# level
motion_name_by_lv[202] = "rhythm.yaml" # 리듬타기
motion_name_by_lv[203] = "zombie.yaml" # 걸음마
motion_name_by_lv[204] = "kick.yaml" # 발차기
motion_name_by_lv[205] = "stretching.yaml" # 스트레칭
motion_name_by_lv[206] = "jumping.yaml" # 점프
motion_name_by_lv[207] = "shuffle.yaml" # 셔플댄스
motion_name_by_lv[208] = "dab.yaml" # 댑
motion_name_by_lv[209] = "hype_boy.yaml" # 춤

# interaction
motion_name_by_lv[100] = "walking.yaml" # 산책하기
motion_name_by_lv[101] = "shower.yaml" # 샤워하기
motion_name_by_lv[102] = "full.yaml"   # 밥먹기
motion_name_by_lv[103] = "wave_hello.yaml" # 안녕
motion_name_by_lv[104] = "basic.yaml" 

def handler(event, context):
    char_anno_dir = "/function/gitmagotchi/assets"
    motion_cfg_dir = "/function/gitmagotchi/config/motion"
    retarget_cfg_fn = "/function/gitmagotchi/config/retarget/fair1_ppf.yaml"
    usr_assets_dir = "/tmp/out/character_assets"
    print(event)
    
    body = json.loads(event["Records"][0]["body"])
    character_id = body["characterId"]
    level = body["requiredLevel"]
    adult_or_child = body["adultOrChild"]
    user_id = body["userId"]

    # tmp에 characterId 폴더를 생성함
    usr_assets_path = os.path.join(usr_assets_dir, str(character_id))
    if not os.path.exists(usr_assets_path):
        os.makedirs(usr_assets_path)

    motion_cfg_fn = str(Path(motion_cfg_dir, motion_name_by_lv[level]).resolve())
    char_anno_path = str(Path(char_anno_dir, adult_or_child).resolve())
    usr_assets_path = os.path.join(usr_assets_path, adult_or_child)
    if not os.path.exists(usr_assets_path):
        os.makedirs(usr_assets_path)

    success = image_to_animation(character_id, user_id, adult_or_child, level, char_anno_path, usr_assets_path, motion_cfg_fn, retarget_cfg_fn)
    if not success:
        return json.dumps({'statusCode': 500,
                'body': 'Motion assignment failed.'})
    return json.dumps({'statusCode': 200, 'body': 'Ready!'})