import tw from "tailwind-styled-components";

interface IProps {
  imgSrc: string;
  username: string;
  nickname: string;
  text: string;
}

export default function UserChat({ imgSrc, username, nickname, text }: IProps) {
  return (
    <Wrapper>
      <InfoRow>
        <ImgContainer>
          <img src={imgSrc} className="w-12 rounded-md shadow-md" />
        </ImgContainer>
        <Info>
          <GithubUsername>{username}</GithubUsername>
          <Name>{nickname}</Name>
        </Info>
      </InfoRow>
      <ChatRow>
        <ChatBox>
          <ChatText>{text}</ChatText>
        </ChatBox>
      </ChatRow>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
p-2
flex
flex-col
space-y-2
items-end
`;

const InfoRow = tw.div`
w-full
flex
flex-row-reverse
space-x-2
`;

const ImgContainer = tw.div`
w-16
h-16
flex
justify-center
items-center
`;

const Info = tw.div`
flex-grow
h-full
flex
flex-col
items-end
space-y-2
justify-center
`;

const GithubUsername = tw.h4`
text-xs
`;

const Name = tw.h2`
text-base
font-semibold
`;

const ChatRow = tw.div`
max-w-1/2
px-2
`;

const ChatBox = tw.div`
w-full
min-h-10
rounded-lg
shadow-lg
bg-slate-100
py-2
px-4
`;

const ChatText = tw.p`
text-base
`;
