import tw from "tailwind-styled-components";
import CommonButton from "@/components/common/CommonButton";
import CommonInput from "@/components/common/CommonInput";
import { useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { characterDataAtom } from "@/store/character";
import { useMutation } from "@tanstack/react-query";
import { modifyCharacter } from "@/api/character";
import { userDataAtom } from "@/store/user";
import { useNavigate } from "react-router-dom";

export default function CharacterRename() {
  const navigate = useNavigate();
  const setUserData = useSetRecoilState(userDataAtom);
  const [characterData, setCharacterData] = useRecoilState(characterDataAtom);
  const [newName, setNewName] = useState<string>(characterData ? characterData.name : "");

  const mutation = useMutation({
    mutationFn: modifyCharacter,
    onSuccess: (data) => {
      setCharacterData((prev) => ({
        ...prev!,
        name: newName,
      }));
      // 골드 감소
      console.log(data);
      setUserData((prev) => prev);

      navigate("/character", { replace: true });
    },
    onError: (err) => console.log(err),
  });

  const onChangeNewName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setNewName(e.target.value);
  };

  const rename = () => {
    mutation.mutate({
      body: JSON.stringify({
        characterId: characterData?.characterId,
        name: newName,
      }),
    });
  };

  return (
    <Wrapper>
      <img src={characterData?.faceUrl} className="w-60" />
      <Content>
        <DesktopTitle>
          <Title>새 이름을 입력해주세요.</Title>
        </DesktopTitle>
        <ButtonContainer>
          <PromptContainer>
            <CommonInput
              props={{ placeholder: "캐릭터 이름", onChange: onChangeNewName, value: newName }}
            />
          </PromptContainer>
          <CommonButton title={"확인 (💰100)"} onClick={rename} />
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
