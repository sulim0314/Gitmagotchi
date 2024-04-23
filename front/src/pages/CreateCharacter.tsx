import tw from "tailwind-styled-components";
import SampleCharacterImage from "@/assets/images/sampleCharacter.png";
import CommonButton from "@/components/common/CommonButton";
import { Link } from "react-router-dom";

export default function CreateCharacter() {
  return (
    <Wrapper>
      <img src={SampleCharacterImage} className="w-60" />
      <Content>
        <DesktopTitle>
          <Title>깃마고치</Title>
          <Description>생성형 AI를 통해</Description>
          <Description>나만의 다마고치를 키워보세요.</Description>
        </DesktopTitle>
        <ButtonContainer>
          <Link to={"/character/create/default"}>
            <CommonButton title={"기본 캐릭터 선택"} />
          </Link>
          <Link to={"/character/create/ai"}>
            <CommonButton title={"AI로 캐릭터 생성"} />
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
h-60
`;

const DesktopTitle = tw.div`
hidden
lg:flex
lg:flex-col
items-center
space-y-4
`;

const Title = tw.h1`
font-medium
text-3xl
mb-6
`;

const Description = tw.p`
text-base
text-slate-500
`;

const ButtonContainer = tw.div`
h-60
flex
flex-col
space-y-4
lg:flex-row
lg:space-y-0
lg:space-x-4
justify-center
items-center
`;
