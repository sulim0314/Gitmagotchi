# Copyright (c) Meta Platforms, Inc. and affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import animated_drawings.render
from pathlib import Path



def annotations_to_animation(char_anno_dir: str, usr_assets_dir: str, motion_cfg_fn: str, retarget_cfg_fn: str):
    # mvc config 파일 생성
    animated_drawing_dict = {
        'character_cfg': str(Path(char_anno_dir, 'char_cfg.yaml').resolve()),
        'usr_assets_dir': str(Path(usr_assets_dir)),
        'motion_cfg': str(Path(motion_cfg_fn).resolve()),
        'retarget_cfg': str(Path(retarget_cfg_fn).resolve())
    }
    motion_output_path =  str(Path(usr_assets_dir, "sprite-sheet.png").resolve())
    mvc_cfg = {
        'scene': {'ANIMATED_CHARACTERS': [animated_drawing_dict]}, 
        'controller': {
            'MODE': 'video_render',
            'OUTPUT_VIDEO_PATH': motion_output_path}
    }

    # 모션 부여
    animated_drawings.render.start(mvc_cfg)
