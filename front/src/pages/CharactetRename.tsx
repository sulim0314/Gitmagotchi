import tw from "tailwind-styled-components";
import sampleCharacter2Image from "@/assets/images/sampleCharacter2.png";
import CommonButton from "@/components/common/CommonButton";
import CommonInput from "@/components/common/CommonInput";

export default function CharacterRename() {
  return (
    <Wrapper>
      <img src={sampleCharacter2Image} className="w-60" />
      <Content>
        <DesktopTitle>
          <Title>새 이름을 입력해주세요.</Title>
        </DesktopTitle>
        <ButtonContainer>
          <PromptContainer>
            <CommonInput props={{ placeholder: "캐릭터 이름" }} />
          </PromptContainer>
          <CommonButton title={"확인 (💰100)"} onClick={() => {}} />
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
bg-[#f2f2f2]
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

const PromptContainer = tw.div`
py-0
w-72
`;
