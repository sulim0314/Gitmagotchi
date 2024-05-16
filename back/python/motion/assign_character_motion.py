
from gitmagotchi.motion.image_to_animation import image_to_animation, check_motion
from gitmagotchi.face.new_character import make_new_character
from pathlib import Path
import os
import json

motion_name_by_lv = dict()

# level
motion_name_by_lv[202] = "rhythm.yaml" # 리듬타기
motion_name_by_lv[203] = "zombie.yaml" # 걸음마
motion_name_by_lv[204] = "kick.yaml" # 발차기
motion_name_by_lv[205] = "stretching.yaml" # 스트레칭
motion_name_by_lv[206] = "jumping.yaml" 
motion_name_by_lv[207] = "shuffle.yaml" # 셔플댄스
motion_name_by_lv[208] = "dab.yaml" # 댑
motion_name_by_lv[209] = "hype_boy.yaml" # 춤

# interaction
motion_name_by_lv[100] = "walking.yaml" # 산책하기
motion_name_by_lv[101] = "shower.yaml" # 샤워하기
motion_name_by_lv[102] = "full.yaml"   # 밥먹기
motion_name_by_lv[103] = "wave_hello.yaml" # 안녕
motion_name_by_lv[104] = "basic.yaml" 

def start(event: dict):

    char_anno_dir = "/function/gitmagotchi/assets"
    motion_cfg_dir = "/function/gitmagotchi/config/motion"
    retarget_cfg_fn = "/function/gitmagotchi/config/retarget/fair1_ppf.yaml"
    usr_assets_dir = "/tmp/out/character_assets"

    # char_anno_dir = "AnimatedDrawings/gitmagotchi/assets"
    # motion_cfg_dir = "AnimatedDrawings/gitmagotchi/config/motion"
    # retarget_cfg_fn = "AnimatedDrawings/gitmagotchi/config/retarget/fair1_ppf.yaml"
    # usr_assets_dir = "character_assets"

    character_id = event["characterId"]
    level = event["requiredLevel"]
    # character_id = 54
    # level = 8

    # tmp에 characterId 폴더를 생성함
    usr_assets_path = os.path.join(usr_assets_dir, str(character_id))
    if not os.path.exists(usr_assets_path):
        os.makedirs(usr_assets_path)

    success, user_id = make_new_character(character_id, level, char_anno_dir, usr_assets_path)
    if not success:
        return {'statusCode': 404, 'body': 'No Face!'}

    if level > 9:
        return json.dumps({'statusCode': 400, 'body': 'Exceeded Maxium Level'})
    
    level += 201
    # 해당 레벨 모션이 이미 만들어져있는지 체크하기
    success = check_motion(character_id, level)
    if not success:
        return {'statusCode': 200, 'body': 'Ready!'}

    # 레벨 별 모션 생성
    motion_cfg_fn = str(Path(motion_cfg_dir, motion_name_by_lv[level]).resolve())
    adult_anno_dir = str(Path(char_anno_dir, "adult").resolve())
    adult_usr_assets_path = os.path.join(usr_assets_path, "adult")
    if not os.path.exists(adult_usr_assets_path):
        os.makedirs(adult_usr_assets_path)

    success = image_to_animation(character_id, user_id, "adult", level, adult_anno_dir, adult_usr_assets_path, motion_cfg_fn, retarget_cfg_fn)
    if not success:
        return json.dumps({'statusCode': 500,
                'body': 'Motion assignment failed.'})
    if level == 205:
        level_list = [100, 101, 102, 103, 104]
        for lv in level_list:
            motion_cfg_fn = str(Path(motion_cfg_dir, motion_name_by_lv[lv]).resolve())
            success = image_to_animation(character_id, user_id, "adult", lv, adult_anno_dir, adult_usr_assets_path, motion_cfg_fn, retarget_cfg_fn)
            if not success:
                return json.dumps({'statusCode': 500,
                        'body': 'Motion assignment failed.'})
        
    # 어린이 모션도 추가 생성
    if level<205:
        motion_cfg_fn = str(Path(motion_cfg_dir, motion_name_by_lv[level]).resolve())
        child_anno_dir = str(Path(char_anno_dir, "child").resolve())
        child_usr_assets_path = os.path.join(usr_assets_path, "child")
        if not os.path.exists(child_usr_assets_path):
            os.makedirs(child_usr_assets_path)
        
        success = image_to_animation(character_id, user_id, "child", level, child_anno_dir, child_usr_assets_path, motion_cfg_fn, retarget_cfg_fn)
        if not success:
            return json.dumps({'statusCode': 500,
                    'body': 'Motion assignment failed.'})
        if level == 202:
            level_list = [100, 101, 102, 103, 104]
            for lv in level_list:
                motion_cfg_fn = str(Path(motion_cfg_dir, motion_name_by_lv[lv]).resolve())
                success = image_to_animation(character_id, user_id, "child", lv, child_anno_dir, child_usr_assets_path, motion_cfg_fn, retarget_cfg_fn)
                if not success:
                    return json.dumps({'statusCode': 500,
                            'body': 'Motion assignment failed.'})

    return json.dumps({'statusCode': 200, 'body': 'Ready!'})

def handler(event, context):
    return start(event=event)

if __name__ == "__main__":
    handler(None, None)
