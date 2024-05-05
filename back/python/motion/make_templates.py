import sys
from gitmagotchi.motion.image_to_animation import image_to_animation
from gitmagotchi.sprite_sheet.gif_to_sheet import gif_to_sheet
import os

def start(char_anno_dir: str, motion_cfg_fn: str):
    if char_anno_dir is None:
        char_anno_dir = "AnimatedDrawings/gitmagotchi/out"
        # char_anno_dir = "/function/gitmagotchi/out"
    
    if motion_cfg_fn is None:
        motion_cfg_fn = "AnimatedDrawings/gitmagotchi/config/motion/dab.yaml"
        # motion_cfg_fn = "/function/gitmagotchi/config/motion/dab.yaml"
    
    retarget_cfg_fn = "AnimatedDrawings/gitmagotchi/config/retarget/fair1_ppf.yaml"
    # retarget_cfg_fn = "/function/gitmagotchi/config/retarget/fair1_ppf.yaml"
    
    # 이미지 생성
    image_to_animation(char_anno_dir, motion_cfg_fn, retarget_cfg_fn)

    # sprite sheet 생성
    # gif_to_sheet(char_anno_dir)

def handler(event, context):
    start(None, None)
    return "OK"

if __name__ == "__main__":
    handler(None, None)
