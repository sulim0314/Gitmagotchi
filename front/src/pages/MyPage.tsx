import tw from "tailwind-styled-components";
import sampleProfileImage from "@/assets/images/sampleProfile.png";
import { HiOutlinePencil } from "react-icons/hi";

export default function MyPage() {
  return (
    <Wrapper>
      <UserInfoContainer>
        <UserContainer>
          <img
            src={sampleProfileImage}
            className="w-16 lg:w-24 rounded-md shadow-md"
          />
          <UserDetailContainer>
            <GitHubUsername>Tama1001</GitHubUsername>
            <NicknameContainer>
              <Nickname>코드몽키</Nickname>
              <PenIcon />
            </NicknameContainer>
          </UserDetailContainer>
        </UserContainer>
        <DetailContainer>
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
          <img src={"https://ghchart.rshah.org/rheeeuro"} className="w-full" />
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

const DelteText = tw.p`
pt-10
text-slate-500
`;

const DeleteLink = tw.span`
underline
`;
