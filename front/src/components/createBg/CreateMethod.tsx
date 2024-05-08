import tw from "tailwind-styled-components";
import PictureImage from "@/assets/images/picture.png";
import CommonButton from "@/components/common/CommonButton";

interface IProps {
  setProcess: React.Dispatch<React.SetStateAction<number>>;
}

export default function CreateMethod({ setProcess }: IProps) {
  return (
    <Wrapper>
      <img src={PictureImage} className="w-60" />
      <Content>
        <DesktopTitle>
          <Title>배경화면 생성</Title>
          <Description>배경화면을 생성할 방법을 선택해주세요.</Description>
          <Description>생성형 AI로 만들거나 업로드할 수 있어요.</Description>
        </DesktopTitle>
        <ButtonContainer>
          <CommonButton onClick={() => setProcess(2)} title={"사용자 이미지 업로드"} />
          <CommonButton onClick={() => setProcess(1)} title={"AI로 배경 이미지 생성"} />
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
