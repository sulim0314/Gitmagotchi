import tw from "tailwind-styled-components";

interface IProps {
  imgSrc: string;
  level: number;
  name: string;
  text: string;
}

export default function CharacterChat({ imgSrc, level, name, text }: IProps) {
  return (
    <Wrapper>
      <InfoRow>
        <ImgContainer>
          <img src={imgSrc} className="w-16" />
        </ImgContainer>
        <Info>
          <Level>{`LV. ${level}`}</Level>
          <Name>{name}</Name>
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
items-start
`;

const InfoRow = tw.div`
w-full
flex
space-x-2
items-center
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
items-start
space-y-2
justify-center
`;

const Level = tw.h4`
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
max-w-md
lg:max-w-xl
min-h-10
rounded-lg
shadow-lg
border-2
border-slate-800
bg-slate-100
py-2
px-4
`;

const ChatText = tw.p`
text-base
`;
