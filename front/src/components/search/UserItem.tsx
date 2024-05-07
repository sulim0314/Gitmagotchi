import tw from "tailwind-styled-components";
import { IUser } from "@/models";

interface IProps {
  user: IUser;
}

export default function UserItem({ user }: IProps) {
  return (
    <Wrapper>
      <UserContainer>
        <UserDetailContainer>
          <img src={user.profileImg} className="w-12 rounded-md shadow-md" />
          <Nickname>{user.nickname}</Nickname>
        </UserDetailContainer>
        <GitHubUsername>{user.githubUsername}</GitHubUsername>
      </UserContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-24
pr-4
flex
justify-between
border-b
border-slate-300
`;

const UserContainer = tw.div`
w-20
flex-grow
flex
items-center
justify-between
px-14
`;

const UserDetailContainer = tw.div`
h-full
flex
items-center
space-x-10
`;

const GitHubUsername = tw.h4`
text-xs
`;

const Nickname = tw.h1`
font-semibold
text-lg
`;
