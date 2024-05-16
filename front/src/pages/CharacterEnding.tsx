import tw from "tailwind-styled-components";
import CommonButton from "@/components/common/CommonButton";
import { useRecoilState, useSetRecoilState } from "recoil";
import { userDataAtom } from "@/store/user";
import { characterDataAtom } from "@/store/character";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { endingCharacter } from "@/api/character";

export default function CharacterEnding() {
  const navigate = useNavigate();
  const [characterData, setCharacterData] = useRecoilState(characterDataAtom);
  const setUserData = useSetRecoilState(userDataAtom);

  const mutation = useMutation({
    mutationFn: endingCharacter,
    onSuccess: (data) => {
      console.log(data.message);
      setUserData((prev) => ({
        ...prev!,
        characterId: null,
      }));
      setCharacterData(null);

      navigate("/", { replace: true });
    },
    onError: (err) => console.log(err),
  });

  const endingText = () => {
    if (!characterData) return;
    if (characterData.exp === 230) {
      return (
        <DesktopTitle>
          <Title>{`${characterData?.name} 캐릭터가`}</Title>
          <Title>최고 레벨을 달성해</Title>
          <Title>명예의 전당에 등록됩니다.</Title>
        </DesktopTitle>
      );
    } else if (characterData.status.cleanness === 0) {
      return (
        <DesktopTitle>
          <Title>{`${characterData?.name} 캐릭터가`}</Title>
          <Title>청결도가 0이 되어</Title>
          <Title>병사했습니다.</Title>
        </DesktopTitle>
      );
    } else if (characterData.status.fullness === 0) {
      return (
        <DesktopTitle>
          <Title>{`${characterData?.name} 캐릭터가`}</Title>
          <Title>포만감이 0이 되어</Title>
          <Title>아사했습니다.</Title>
        </DesktopTitle>
      );
    } else if (characterData.status.intimacy === 0) {
      return (
        <DesktopTitle>
          <Title>{`${characterData?.name} 캐릭터가`}</Title>
          <Title>친밀도이 0이 되어</Title>
          <Title>가출했습니다.</Title>
        </DesktopTitle>
      );
    }
  };

  const endingConfirm = () => {
    if (!characterData) return;
    if (characterData.exp === 230) {
      mutation.mutate({ body: JSON.stringify({ endingType: "INDEPENDENT" }) });
    } else if (characterData.status.cleanness === 0) {
      mutation.mutate({ body: JSON.stringify({ endingType: "SICK" }) });
    } else if (characterData.status.fullness === 0) {
      mutation.mutate({ body: JSON.stringify({ endingType: "HUNGRY" }) });
    } else if (characterData.status.intimacy === 0) {
      mutation.mutate({ body: JSON.stringify({ endingType: "RUNAWAY" }) });
    }
  };

  return (
    <Wrapper>
      <ImgContainer>
        <CharacterImg src={characterData?.faceUrl} />
      </ImgContainer>
      <Content>
        {endingText()}
        <ButtonContainer>
          <CommonButton title={"확인"} onClick={endingConfirm} />
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

const CharacterImg = tw.img`
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
lg:space-y-4
`;

const Title = tw.h1`
font-medium
text-3xl
my-4
lg:mb-6
`;

const ButtonContainer = tw.div`
lg:h-72
flex
flex-col
space-y-4
justify-center
items-center
`;
