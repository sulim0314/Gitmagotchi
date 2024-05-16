import tw from "tailwind-styled-components";
import CommonButton from "@/components/common/CommonButton";
import { useRecoilState, useSetRecoilState } from "recoil";
import { characterDataAtom } from "@/store/character";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { deleteCharacter } from "@/api/character";
import { userDataAtom } from "@/store/user";

export default function DeleteCharacterConfirm() {
  const navigate = useNavigate();
  const [characterData, setCharacterData] = useRecoilState(characterDataAtom);
  const setUserData = useSetRecoilState(userDataAtom);

  const mutation = useMutation({
    mutationFn: deleteCharacter,
    onSuccess: (data) => {
      console.log(data.message);
      setCharacterData(null);
      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          characterId: null,
        };
      });
      navigate("/character/create");
    },
    onError: (err) => console.log(err),
  });

  const deleteConfirm = () => {
    mutation.mutate();
  };

  return (
    <Wrapper>
      <img src={characterData?.faceUrl} className="w-60" />
      <Content>
        <DesktopTitle>
          <Title>{`정말로 ${characterData?.name} 캐릭터를`}</Title>
          <Title>방출하시겠어요?</Title>
        </DesktopTitle>
        <ButtonContainer>
          <CommonButton title={"방출"} onClick={deleteConfirm} />
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
