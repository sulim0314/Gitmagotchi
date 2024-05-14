import tw from "tailwind-styled-components";
import CommonButton from "@/components/common/CommonButton";
import { useSetRecoilState } from "recoil";
import { userDataAtom } from "@/store/user";

interface IProps {
  createdId: number | null;
  createdName: string;
  faceUrl: string;
}

export default function CreateResult({ createdId, createdName, faceUrl }: IProps) {
  const setUserData = useSetRecoilState(userDataAtom);

  const resultConfirm = () => {
    if (!createdId) return;
    setUserData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        characterId: createdId,
      };
    });
  };

  return (
    <Wrapper>
      <ImgContainer>
        <CreatedImg src={faceUrl} />
      </ImgContainer>
      <Content>
        <DesktopTitle>
          <Title>{`${createdName} 캐릭터가`}</Title>
          <Title>생성되었어요.</Title>
        </DesktopTitle>
        <ButtonContainer>
          <CommonButton title={"확인"} onClick={resultConfirm} />
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

const ImgContainer = tw.div`
w-60
h-60
`;

const CreatedImg = tw.img`
scale-125
translate-y-1
w-60
h-60
`;

const Content = tw.div`
flex
flex-col
justify-center
items-center
space-y-4
lg:h-80
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
