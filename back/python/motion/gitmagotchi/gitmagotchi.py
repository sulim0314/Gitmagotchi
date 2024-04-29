from motion.image_to_animation import image_to_animation


def image_to_motion(char_anno_dir:str, motion_cfg_fn:str, retarget_cfg_fn:str):
    image_to_animation(char_anno_dir, motion_cfg_fn, retarget_cfg_fn)

if __name__ == '__main__':
    # char_anno_dir = sys.argv[1]
    # motion_cfg_fn = sys.argv[2]
    # retarget_cfg_fn = sys.argv[3]

    char_anno_dir = "out"
    motion_cfg_fn = "config/motion/dab.yaml"
    retarget_cfg_fn = "config/retarget/fair1_ppf.yaml"
    image_to_animation(char_anno_dir, motion_cfg_fn, retarget_cfg_fn)
