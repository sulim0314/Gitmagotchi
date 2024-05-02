import sys
from gitmagotchi.motion.image_to_animation import image_to_animation
import os

def image_to_motion(char_anno_dir:str, motion_cfg_fn:str, retarget_cfg_fn:str):
    image_to_animation(char_anno_dir, motion_cfg_fn, retarget_cfg_fn)

def handler(event, context):
    char_anno_dir = "out"
    # motion_cfg_fn = "gitmagotchi/config/motion/dab.yaml"
    # retarget_cfg_fn = "gitmagotchi/config/retarget/fair1_ppf.yaml"
    motion_cfg_fn = "AnimatedDrawings/gitmagotchi/config/motion/dab.yaml"
    retarget_cfg_fn = "AnimatedDrawings/gitmagotchi/config/retarget/fair1_ppf.yaml"
    image_to_animation(char_anno_dir, motion_cfg_fn, retarget_cfg_fn)

    # s3에 저장
    file_path = os.path.join(char_anno_dir, "video.gif")
    if os.path.exists(file_path):
        return True
    return False

if __name__ == "__main__":
    handler(None, None)
