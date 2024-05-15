import cv2
from pathlib import Path
from PIL import Image
import numpy as np

import yaml
from collections import defaultdict

texture = None
mask = None
char_cfg = None
new_face = None


'''
    이미지 로드
'''
def load_image(template_path: Path):
    global texture
    global mask
    global char_cfg
    global new_face
    
    texture_path = str(Path(template_path / "texture.png").resolve())
    mask_path = str(Path(template_path / "mask.png").resolve())
    char_cfg_path = str(Path(template_path / "char_cfg.yaml").resolve())
    new_face_path = str(Path(template_path / "new_face.png").resolve())

    texture = cv2.imread(texture_path, cv2.IMREAD_UNCHANGED)
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    new_face = cv2.imread(new_face_path, cv2.IMREAD_UNCHANGED)
    
    with open(char_cfg_path, 'r') as f:
        char_cfg = defaultdict(dict, yaml.load(f, Loader=yaml.FullLoader) or {})

    # print(type(texture))
    # print(mask)
    # print(new_face)
    # print(char_cfg)

'''
    배경 제거
'''
def remove_bg(texture: np.ndarray, mask: np.ndarray, save_path: Path):
    shape = texture.shape
    new_texture = np.ndarray((shape))
    new_texture[mask > 0] = texture[mask > 0]

    if save_path:
        path = str(Path(save_path / "texture.png").resolve())
        cv2.imwrite(path, new_texture)
    return new_texture

'''
    default character 생성하기
'''
def add_face(texture: np.ndarray , face: np.ndarray, offset_face: list):
    face_shape = face.shape
    # RGB인 경우, RGBA로 변환
    if face.shape[2] == 3:
        print("Invalid Format!")
        return

    def get_start_idx(face: np.ndarray):
        startIdx = np.argmax(face[:,:,-1])
        startIdx = np.unravel_index(startIdx, (face.shape[0], face.shape[1]))
        y = startIdx[0]

        startIdx = np.argmax(np.rot90(face[:,:,-1]))
        startIdx = np.unravel_index(startIdx, (face.shape[0], face.shape[1]))
        x = startIdx[0]-6
        return y, x

    # 붙일 얼굴 resize
    face_resized = cv2.resize(face, dsize=(0,0), fx=0.5, fy=0.5)
    
    # 붙일 얼굴 시작점 crop
    start_y, start_x = get_start_idx(face_resized)
    face_cropped = face_resized[start_y:,start_x:]
    # cv2.imshow("debug", face_cropped)
    # cv2.waitKey(0)

    # 붙일 얼굴 위치 지정
    face_moved = np.zeros(texture.shape)
    offset_l, offset_t = offset_face[0], offset_face[1]

    # def make_new_char_cfg():
    #     pass
    # if offset_l:offset_l+face_cropped.shape[1] > texture.shape[1]-1:
    #     pass

    face_moved[offset_t:offset_t+face_cropped.shape[0], offset_l:offset_l+face_cropped.shape[1]] = face_cropped
    # mask 생성
    face_mask = face_moved[:,:,-1]

    # 얼굴 붙이기
    texture[face_mask>0] = face_moved[face_mask>0]

    # cv2.imshow("debug", texture)
    # cv2.waitKey(0)
    save_charcater_path = str(Path(save_path / "texture.png").resolve())
    cv2.imwrite(save_charcater_path, texture)

    mask[face_mask > 0] = face_mask[face_mask > 0]
    save_mask_path = str(Path(save_path / "mask.png").resolve())
    cv2.imwrite(save_mask_path, mask)

if __name__ == "__main__":
    template_path = Path("./assets/template-assets")
    save_path = Path("./assets/character-assets")   
    # 1. 필요한 이미지 로드
    load_image(template_path)

    # 1-1. texture 배경제거가 필요한 경우 배경제거
    # texture = remove_bg(texture, mask, save_path)

    # 2. 배경제거 된 texture에 얼굴 합치기
    texture = add_face(texture, new_face, [134,4])

