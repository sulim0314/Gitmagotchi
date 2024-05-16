import CommonButton from "@/components/common/CommonButton";
import { userDataAtom } from "@/store/user";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { MdOutlineCameraAlt } from "react-icons/md";
import tw from "tailwind-styled-components";
import { useMutation } from "@tanstack/react-query";
import { modifyUser } from "@/api/user";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useRecoilState(userDataAtom);
  const [nickname, setNickname] = useState<string>(userData?.nickname || "");
  const [profileImg, setProfileImg] = useState<string | null>(userData?.profileImg || "");
  const mutation = useMutation({
    mutationFn: modifyUser,
    onSuccess: (data) => {
      setUserData((prev) => {
        if (prev === null) return null;
        return {
          ...prev,
          nickname: data.nickname,
          profileImg: data.profileImg || prev.profileImg,
        };
      });
      navigate("/mypage", { replace: true });
    },
    onError: (err) => console.log(err),
  });

  const onChangeProfileImg: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise<void>((resolve) => {
        reader.onload = () => {
          setProfileImg((reader.result as string) || null); // 파일의 컨텐츠
          resolve();
        };
      });
    }
  };

  const onChangeNickname: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setNickname(e.target.value);
  };

  const submit = () => {
    if (!userData?.id) return;
    mutation.mutate({
      body: JSON.stringify({
        userId: userData.id,
        nickname,
        profileImg: profileImg === userData?.profileImg ? null : profileImg,
      }),
    });
  };

  return (
    <Wrapper>
      <UserInfoContainer>
        <Title>회원 정보 수정</Title>
        <UserContainer>
          <ProfileImgContainer htmlFor="file">
            <ProfileImg src={profileImg || ""} />
            <EditButton>
              <CameraIcon />
              <EditText>이미지 변경</EditText>
            </EditButton>
          </ProfileImgContainer>
          <ImgInput
            type="file"
            name="file"
            id="file"
            accept="image/*"
            onChange={onChangeProfileImg}
          />
          <UserDetailContainer>
            <GitHubUsername>{userData?.githubUsername}</GitHubUsername>
            <NicknameContainer>
              <Nickname value={nickname} onChange={onChangeNickname} />
            </NicknameContainer>
          </UserDetailContainer>
        </UserContainer>
        <CommonButton title="변경" onClick={submit} />
      </UserInfoContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
`;

const UserInfoContainer = tw.div`
w-full
h-full
pb-20
pt-10
flex
flex-col
items-center
justify-between
`;

const Title = tw.h1`
text-2xl
font-bold
`;

const UserContainer = tw.div`
w-full
flex
flex-col
items-center
space-y-4
p-10
`;

const UserDetailContainer = tw.div`
flex
flex-col
items-center
space-y-8
`;

const GitHubUsername = tw.h4`
text-base
lg:text-xl
`;

const ProfileImgContainer = tw.label`
w-40
lg:w-60
rounded-md
shadow-md
overflow-hidden
relative
group
border-2
border-slate-800
`;

const ProfileImg = tw.img`
w-40
h-40
object-contain
bg-slate-200
lg:w-60
lg:h-60
`;

const EditButton = tw.div`
absolute
cursor-pointer
left-0
top-0
w-full
h-full
flex
opacity-0
group-hover:opacity-100
transition-all
bg-slate-800/40
flex-col
justify-center
items-center
space-y-2
`;

const CameraIcon = tw(MdOutlineCameraAlt)`
w-10
h-10
text-slate-200
`;

const EditText = tw.h4`
font-bold
text-slate-200
`;

const ImgInput = tw.input`
hidden
`;

const NicknameContainer = tw.div`
flex
space-x-4
items-center
`;

const Nickname = tw.input`
font-semibold
text-2xl
lg:text-3xl
rounded-xl
border-2
border-slate-800
px-4
`;
