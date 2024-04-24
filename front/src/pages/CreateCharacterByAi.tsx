import tw from "tailwind-styled-components";
import AiImage from "@/assets/images/ai.png";
import CommonButton from "@/components/common/CommonButton";
import { Link } from "react-router-dom";
import CommonInput from "@/components/common/CommonInput";

export default function CreateCharacterByAi() {
  return (
    <Wrapper>
      <img src={AiImage} className="w-60" />
      <Content>
        <DesktopTitle>
          <Title>생성할 캐릭터를 적어주세요.</Title>
          <Description>AI가 생성할 캐릭터에 대해 구체적으로 작성해주세요.</Description>
          <Description>구체적일수록 정확하게 생성되요.</Description>
        </DesktopTitle>
        <ButtonContainer>
          <CommonInput props={{ placeholder: "EX) 귀여운 오리" }} />
          <Link to={"/character/create/ai"}>
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
justify-center
items-center
`;
