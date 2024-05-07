import cv2
from pathlib import Path
import numpy as np

def make_new_character(char_anno_dir: str, usr_assets_dir: str):

    texture_path = str(Path(char_anno_dir, "texture.png"))
    face_path = str(Path(usr_assets_dir, "image-face.png"))
    new_img_path = str(Path(usr_assets_dir, "texture.png"))
    
    full_img = cv2.imread(texture_path, cv2.IMREAD_UNCHANGED)
    face_img = cv2.imread(face_path, cv2.IMREAD_UNCHANGED)

    b,t,l,r=798,112,208,782
    face_img_cropped = face_img[t:b, l:r]
    face_img_masked = np.where((255 - face_img_cropped[:, :, 3])>0, 0, 255).astype(np.uint8)
    full_img[face_img_masked > 0] = face_img_cropped[face_img_masked > 0]

    # cv2.imshow("added", full_img)
    # cv2.waitKey()
    cv2.imwrite(new_img_path, full_img)
