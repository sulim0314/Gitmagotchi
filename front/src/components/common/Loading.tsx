import tw from "tailwind-styled-components";
import LoadingGif from "@/assets/images/loading.gif";
import { useEffect, useRef, useState } from "react";

export default function Loading() {
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const [count, setCount] = useState<number>(1);

  useEffect(() => {
    intervalId.current = setInterval(() => {
      setCount((prev) => {
        if (prev === 3) {
          return 1;
        } else {
          return prev + 1;
        }
      });
    }, 300);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  return (
    <Wrapper>
      <Container>
        <Gray />
        <LoadingImg src={LoadingGif} />
        <LoadingText>
          Loading
          <Span>.</Span>
          <Span className={count > 1 ? "" : "text-transparent"}>.</Span>
          <Span className={count > 2 ? "" : "text-transparent"}>.</Span>
        </LoadingText>
      </Container>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-screen
h-screen
flex
justify-center
items-center
bg-[#f2f2f2]
`;

const Container = tw.div`
w-[200px]
h-[200px]
rounded-lg
border-8
border-slate-600
overflow-hidden
relative
bg-white
flex
flex-col
items-center
justify-center
space-y-2
-translate-y-20
shadow-2xl
`;

const Gray = tw.div`
w-full
h-full
absolute
top-0
left-0
bg-gray-600/10
`;

const LoadingImg = tw.img`
w-[100px]
h-[124px]
`;

const LoadingText = tw.h1`
w-full
text-center
text-lg
font-bold
`;

const Span = tw.span``;
