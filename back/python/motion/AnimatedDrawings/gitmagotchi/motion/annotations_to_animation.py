# Copyright (c) Meta Platforms, Inc. and affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import animated_drawings.render
from pathlib import Path

import numpy as np
import cv2
import uuid



def annotations_to_animation(char_anno_dir: str, usr_assets_dir: str, motion_cfg_fn: str, retarget_cfg_fn: str):
    # mvc config 파일 생성
    animated_drawing_dict = {
        'character_cfg': str(Path(char_anno_dir, 'char_cfg.yaml').resolve()),
        'usr_assets_dir': str(Path(usr_assets_dir)),
        'motion_cfg': str(Path(motion_cfg_fn).resolve()),
        'retarget_cfg': str(Path(retarget_cfg_fn).resolve())
    }
    motion_output_path =  str(Path(usr_assets_dir, f"sprite-sheet.png").resolve())
    mvc_cfg = {
        'scene': {'ANIMATED_CHARACTERS': [animated_drawing_dict]}, 
        'controller': {
            'MODE': 'video_render',
            'OUTPUT_VIDEO_PATH': motion_output_path}
    }

    # mask 부여
    texture_path = str(Path(usr_assets_dir , "texture.png").resolve())
    mask_path = str(Path(usr_assets_dir , "mask.png").resolve())
    
    if not Path(mask_path).exists():
        texture = cv2.imread(texture_path, cv2.IMREAD_UNCHANGED)
        mask = texture[:, :, -1]
        cv2.imwrite(mask_path, mask)

        texture = cv2.cvtColor(texture, cv2.COLOR_RGBA2RGB)
        cv2.imwrite(texture_path, texture)

    # 모션 부여
    animated_drawings.render.start(mvc_cfg)
