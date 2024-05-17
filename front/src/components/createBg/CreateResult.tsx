import tw from "tailwind-styled-components";
import CommonButton from "@/components/common/CommonButton";
import { Link } from "react-router-dom";

interface IProps {
  bgUrl: string;
}

export default function CreateResult({ bgUrl }: IProps) {
  return (
    <Wrapper>
      <CreatedImg src={bgUrl} />
      <Content>
        <DesktopTitle>
          <Title>배경화면이 생성되었어요.</Title>
          <Description>생성된 배경화면은 보관함에 저장되었어요.</Description>
        </DesktopTitle>
        <ButtonContainer>
          <Link to={"/background"}>
            <CommonButton title={"확인"} />
          </Link>
        </ButtonContainer>
      </Content>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
lg:flex-row
lg:space-x-32
justify-center
items-center
`;

const CreatedImg = tw.img`
w-60
h-60
shadow-md
rounded-xl
border
border-slate-800
cursor-pointer
`;

const Content = tw.div`
flex
flex-col
justify-center
items-center
space-y-4
h-80
`;

const DesktopTitle = tw.div`
flex
flex-col
items-center
space-y-4
`;

const Title = tw.h1`
font-medium
text-3xl
my-10
lg:mb-6
`;

const Description = tw.p`
text-base
text-slate-500
`;

const ButtonContainer = tw.div`
h-72
flex
flex-col
space-y-4
justify-center
items-center
`;
