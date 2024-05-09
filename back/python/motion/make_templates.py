
from gitmagotchi.motion.image_to_animation import image_to_animation
from gitmagotchi.face.new_character import make_new_character
from pathlib import Path
import os

motion_name_by_lv = dict()
motion_name_by_lv[1] = "wave_hello.yaml"
motion_name_by_lv[2] = "zombie.yaml"
motion_name_by_lv[3] = "jumping.yaml"
motion_name_by_lv[4] = "dab.yaml"
motion_name_by_lv[5] = "dab.yaml"
motion_name_by_lv[6] = "dab.yaml"
motion_name_by_lv[7] = "dab.yaml"
motion_name_by_lv[8] = "dab.yaml"
motion_name_by_lv[9] = "dab.yaml"
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

    # tmp에 characterId 폴더를 생성함
    usr_assets_path = os.path.join(usr_assets_dir, str(character_id))
    if not os.path.exists(usr_assets_path):
        os.makedirs(usr_assets_path)

    # 캐릭터 템플릿 생성
    success, user_id = make_new_character(character_id, level, char_anno_dir, usr_assets_path)
    if not success:
        return {'statusCode': 404,
            'body': 'No Face!'}

    # 레벨 별 모션 생성
    motion_cfg_fn = str(Path(motion_cfg_dir, motion_name_by_lv[level]).resolve())
    success, url = image_to_animation(character_id, user_id, level, char_anno_dir, usr_assets_path, motion_cfg_fn, retarget_cfg_fn)
    if url is None:
        return {'statusCode': 500,
                'body': 'Motion assignment failed.'}
    return {'statusCode': 200, 'body': f'{url}'}

def handler(event, context):
    return start(event=event)

# if __name__ == "__main__":
#     handler(None, None)
