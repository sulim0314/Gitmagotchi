import tw from "tailwind-styled-components";
import AiImage from "@/assets/images/ai.svg";
import CommonButton from "@/components/common/CommonButton";
import CommonInput from "@/components/common/CommonInput";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateBackground } from "@/api/background";

interface IProps {
  setProcess: React.Dispatch<React.SetStateAction<number>>;
  setCreatedUrl: React.Dispatch<React.SetStateAction<string>>;
  createdRef: React.MutableRefObject<HTMLImageElement>;
}

export default function CreateByAi({ setProcess, setCreatedUrl, createdRef }: IProps) {
  const aiRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<Animation>(new Animation());
  const [prompt, setPrompt] = useState<string>("");
  const mutation = useMutation({
    mutationFn: generateBackground,
    onSuccess: (data) => {
      createdRef.current.src = data.imageUrl;
      createdRef.current.onload = () => {
        setCreatedUrl(data.imageUrl);
        setProcess(3);
      };
    },
    onError: (err) => console.log(err),
  });

  const generate: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const userInput = prompt;
    setPrompt("");

    mutation.mutate({ body: JSON.stringify({ userInput }) });
  };

  const onChangePrompt: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPrompt(e.target.value);
  };

  useEffect(() => {
    if (mutation.isPending) {
      const keyframes: Keyframe[] = [
        // { transform: "translate3d(0px, 0, 0)" },
        { transform: "translate3d(-1px, 0, 0)" },
        { transform: "translate3d(2px, 0, 0)" },
        { transform: "translate3d(-4px, 0, 0)" },
        { transform: "translate3d(4px, 0, 0)" },
        { transform: "translate3d(-4px, 0, 0)" },
        { transform: "translate3d(4px, 0, 0)" },
        { transform: "translate3d(-4px, 0, 0)" },
        { transform: "translate3d(2px, 0, 0)" },
        { transform: "translate3d(-1px, 0, 0)" },
        // { transform: "translate3d(0px, 0, 0)" },
      ];
      const options: KeyframeAnimationOptions = {
        delay: 2000,
        duration: 820,
        easing: "cubic-bezier(.36,.07,.19,.97)",
        fill: "both",
        iterations: Infinity,
      };

      animationRef.current = aiRef.current?.animate(keyframes, options) || new Animation();
    } else {
      animationRef.current.cancel();
    }
  }, [mutation.isPending]);

  return (
    <>
      {mutation.isPending || mutation.isSuccess ? (
        <Wrapper>
          <img src={AiImage} ref={aiRef} className="w-60" />
          <Content>
            <DesktopTitle>
              <Title>AI가 캐릭터를 생성하고 있어요.</Title>
              <Description>20초 정도 소요됩니다.</Description>
            </DesktopTitle>
          </Content>
        </Wrapper>
      ) : (
        <Wrapper>
          <img src={AiImage} className="w-60" />
          <Content>
            {mutation.isError ? (
              <DesktopTitle>
                <Title className="text-red-600">생성하는데 문제가 생겼어요.</Title>
                <Description>AI 정책에 위반되는 단어가 포함되었을 수 있어요.</Description>
                <Description>다시 한 번 생성할 배경을 적어주세요.</Description>
              </DesktopTitle>
            ) : (
              <DesktopTitle>
                <Title>생성할 배경 이미지를 적어주세요.</Title>
                <Description>AI가 생성할 배경에 대해 구체적으로 작성해주세요.</Description>
                <Description>구체적일수록 정확하게 생성돼요.</Description>
              </DesktopTitle>
            )}
            <ButtonContainer onSubmit={generate}>
              <PromptContainer>
                <CommonInput
                  props={{ placeholder: "EX) 푸른 초원", value: prompt, onChange: onChangePrompt }}
                />
              </PromptContainer>
              <CommonButton title={"생성 (💰100)"} />
            </ButtonContainer>
          </Content>
        </Wrapper>
      )}
    </>
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
