import tw from "tailwind-styled-components";
import DefaultImage from "@/assets/images/defaultImage.png";
import CommonButton from "@/components/common/CommonButton";

interface IProps {
  setProcess: React.Dispatch<React.SetStateAction<number>>;
}

export default function CreateByUpload({ setProcess }: IProps) {
  const generateBg = () => {
    setProcess(3);
  };

  return (
    <Wrapper>
      <img
        src={DefaultImage}
        className="w-60 h-60 shadow-md rounded-xl border border-slate-800 cursor-pointer"
      />
      <Content>
        <DesktopTitle>
          <Title>이미지를 업로드해주세요.</Title>
          <Description>배경 이미지는 해상도가 높을수록 좋아요.</Description>
        </DesktopTitle>
        <ButtonContainer>
          <CommonButton title={"업로드 (💰50)"} onClick={generateBg} />
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
my-8
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
