import tw from "tailwind-styled-components";
import CommonButton from "@/components/common/CommonButton";
import { Link } from "react-router-dom";

interface IProps {
  faceUrl: string;
  createdName: string;
}

export default function CreateResult({ faceUrl, createdName }: IProps) {
  return (
    <Wrapper>
      <img src={faceUrl} className="w-60" />
      <Content>
        <DesktopTitle>
          <Title>{`${createdName} 캐릭터가`}</Title>
          <Title>생성되었어요.</Title>
        </DesktopTitle>
        <ButtonContainer>
          <Link to={"/"}>
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
my-4
lg:mb-6
`;

const ButtonContainer = tw.div`
h-72
flex
flex-col
space-y-4
justify-center
items-center
`;
