import tw from "tailwind-styled-components";
import sampleCharacterImage from "@/assets/images/sampleCharacter.png";
import CommonButton from "@/components/common/CommonButton";
import CommonInput from "@/components/common/CommonInput";

interface IProps {
  setProcess: React.Dispatch<React.SetStateAction<number>>;
}

export default function CreateConfirm({ setProcess }: IProps) {
  return (
    <Wrapper>
      <img src={sampleCharacterImage} className="w-60" />
      <Content>
        <DesktopTitle>
          <Title>캐릭터가 생성되었어요.</Title>
          <Title>캐릭터의 이름을 지어주세요.</Title>
        </DesktopTitle>
        <ButtonContainer>
          <PromptContainer>
            <CommonInput props={{ placeholder: "캐릭터 이름" }} />
          </PromptContainer>
          <CommonButton title={"확인"} onClick={() => setProcess(3)} />
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

const PromptContainer = tw.div`
py-0
w-72
`;
