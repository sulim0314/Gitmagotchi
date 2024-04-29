# Copyright (c) Meta Platforms, Inc. and affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

from motion.annotations_to_animation import annotations_to_animation
import sys

def image_to_animation(char_anno_dir: str, motion_cfg_fn: str, retarget_cfg_fn: str):
    # create the animation
    annotations_to_animation(char_anno_dir, motion_cfg_fn, retarget_cfg_fn)