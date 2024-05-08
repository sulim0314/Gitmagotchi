import tw from "tailwind-styled-components";
import AiImage from "@/assets/images/ai.png";
import CommonButton from "@/components/common/CommonButton";
import CommonInput from "@/components/common/CommonInput";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateFace } from "@/api/character";

interface IProps {
  setProcess: React.Dispatch<React.SetStateAction<number>>;
  setCreatedUrl: React.Dispatch<React.SetStateAction<string>>;
}

export default function CreateByAi({ setProcess, setCreatedUrl }: IProps) {
  const [prompt, setPrompt] = useState<string>("");
  const mutation = useMutation({
    mutationFn: generateFace,
    onSuccess: (data) => {
      const body = JSON.parse(data.body);
      setCreatedUrl(body.imageUrl);
      setProcess(2);
    },
    onError: (err) => console.log(err),
  });

  const generate: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setPrompt("");

    mutation.mutate({ body: JSON.stringify({ useInput: prompt }) });
  };

  const onChangePrompt: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPrompt(e.target.value);
  };

  return (
    <Wrapper>
      <img src={AiImage} className="w-60" />
      <Content>
        <DesktopTitle>
          <Title>생성할 캐릭터를 적어주세요.</Title>
          <Description>AI가 생성할 캐릭터에 대해 구체적으로 작성해주세요.</Description>
          <Description>구체적일수록 정확하게 생성되요.</Description>
        </DesktopTitle>
        <ButtonContainer onSubmit={generate}>
          <PromptContainer>
            <CommonInput
              props={{ placeholder: "EX) 귀여운 오리", value: prompt, onChange: onChangePrompt }}
            />
          </PromptContainer>
          <CommonButton title={"생성"} />
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

const ButtonContainer = tw.form`
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
