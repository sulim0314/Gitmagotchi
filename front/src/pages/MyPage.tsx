import tw from "tailwind-styled-components";
import { HiOutlinePencil } from "react-icons/hi";
import { Auth } from "aws-amplify";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authDataAtom } from "@/store/auth";
import { userDataAtom } from "@/store/user";
import { useNavigate } from "react-router-dom";
import { characterDataAtom } from "@/store/character";
import { messageDataAtom } from "@/store/message";
import { seoulInstance, usInstance } from "@/api";

export default function MyPage() {
  const navigate = useNavigate();
  const setAuthData = useSetRecoilState(authDataAtom);
  const setCharacterData = useSetRecoilState(characterDataAtom);
  const setMessageData = useSetRecoilState(messageDataAtom);
  const [userData, setUserData] = useRecoilState(userDataAtom);

  const signOut = async () => {
    localStorage.clear();
    setAuthData(null);
    setCharacterData(null);
    setMessageData([]);
    setUserData(null);
    usInstance.interceptors.request.clear();
    seoulInstance.interceptors.request.clear();
    await Auth.signOut();
  };

  const changeName = () => {
    navigate("/editProfile");
  };

  return (
    <Wrapper>
      <UserInfoContainer>
        <UserContainer>
          <ProfileImg src={userData?.profileImg || ""} />
          <UserDetailContainer>
            <GitHubUsername>{userData?.githubUsername}</GitHubUsername>
            <NicknameContainer>
              <Nickname>{userData?.nickname}</Nickname>
              <PenIcon onClick={changeName} />
            </NicknameContainer>
          </UserDetailContainer>
        </UserContainer>
        <DetailContainer>
          <LogoutText onClick={signOut}>로그아웃</LogoutText>
          <DetailRow>
            <DetailText>가입일</DetailText>
            <DetailText>2024.04.26.</DetailText>
          </DetailRow>
        </DetailContainer>
      </UserInfoContainer>
      <CommitContainer>
        <DetailRow>
          <DetailText>COMMITS</DetailText>
        </DetailRow>
        <CommitImgContainer>
          <CommitImg src={`https://ghchart.rshah.org/${userData?.githubUsername}`} />
        </CommitImgContainer>

        <DelteText>
          회원 탈퇴하시려면 <DeleteLink>여기</DeleteLink>를 눌러주세요.
        </DelteText>
      </CommitContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
justify-start
`;

const UserInfoContainer = tw.div`
w-full
flex
flex-col
lg:flex-row
lg:items-end
lg:pb-20
`;

const UserContainer = tw.div`
w-full
flex
items-center
space-x-6
p-10
`;

const UserDetailContainer = tw.div`
flex
flex-col
space-y-2
`;

const GitHubUsername = tw.h4`
text-base
lg:text-xl
`;

const ProfileImg = tw.img`
w-16
lg:w-24
rounded-md
shadow-md
`;

const NicknameContainer = tw.div`
flex
space-x-4
items-center
`;

const Nickname = tw.h1`
font-semibold
text-2xl
lg:text-3xl
`;

const PenIcon = tw(HiOutlinePencil)`
w-4
h-4
lg:w-6
lg:h-6
text-slate-400
cursor-pointer
`;

const CommitImg = tw.img`
w-full
`;

const DetailContainer = tw.div`
w-full
lg:w-80
flex
flex-col
space-y-4
px-10
`;

const DetailRow = tw.div`
flex
justify-between
`;

const DetailText = tw.h4`
`;

const CommitContainer = tw.div`
p-10
`;

const CommitImgContainer = tw.div`
w-full
flex
lg:p-6
`;

const LogoutText = tw.a`
w-full
text-xl
text-red-500
hover:text-red-300
text-right
cursor-pointer
`;

const DelteText = tw.p`
pt-10
text-slate-500
`;

const DeleteLink = tw.span`
underline
cursor-pointer
`;
