import Spritesheet from "react-responsive-spritesheet";
import sampleSpritesheetImage from "@/assets/images/sampleSpritesheet.png";
import defaultFace from "@/assets/images/defaultFace.png";
import { useEffect, useRef, useState } from "react";
import tw from "tailwind-styled-components";

interface IInfo {
  frame: number;
  left: number;
  top: number;
  rotation: number;
}

export default function Test() {
  const spritesheet = useRef<Spritesheet | null>(null);
  const headImg = useRef<HTMLImageElement | null>(null);
  const [frame, setFrame] = useState<number>(1);
  const [left, setLeft] = useState<number>(0);
  const [top, setTop] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [info, setInfo] = useState<IInfo[]>([]);

  useEffect(() => {
    if (headImg.current) {
      headImg.current.style.left = `${left}%`;
      headImg.current.style.top = `${top}%`;
      headImg.current.style.transform = `rotate(${rotation}deg)`;
    }
  }, [headImg, left, top, rotation]);

  const onChangeLeft: React.FormEventHandler<HTMLInputElement> = (e) => {
    setLeft(+e.currentTarget.value);
  };

  const onChangeTop: React.FormEventHandler<HTMLInputElement> = (e) => {
    setTop(+e.currentTarget.value);
  };

  const onChangeRotation: React.FormEventHandler<HTMLInputElement> = (e) => {
    setRotation(+e.currentTarget.value);
  };

  const next = () => {
    setFrame((prev) => {
      setInfo((prev) => [...prev, { frame, left, top, rotation }]);
      console.log(info);
      return prev + 1;
    });
    if (spritesheet.current) {
      spritesheet.current.goToAndPause(frame);
    }
  };

  return (
    <Wrapper>
      <Container>
        <HeadImg ref={headImg} src={defaultFace} />
        <Spritesheet
          style={{ backgroundColor: "white" }}
          image={sampleSpritesheetImage}
          widthFrame={1000}
          heightFrame={1000}
          steps={339}
          fps={30}
          autoplay={false}
          loop={false}
          direction="forward"
          backgroundSize={`cover`}
          backgroundRepeat={`no-repeat`}
          backgroundPosition={`center center`}
          isResponsive={false}
          getInstance={(s) => {
            spritesheet.current = s;
          }}
          onEnterFrame={[
            {
              frame: 338,
              callback: () => {
                if (spritesheet.current) {
                  spritesheet.current.goToAndPause(1);
                }
              },
            },
          ]}
        />
      </Container>
      <Tool>
        {`frame: ${frame}`}
        <RangeInput
          type="range"
          value={left}
          onInput={onChangeLeft}
          min={-100}
          max={100}
          step={0.01}
        />
        {`left: ${left}%`}
        <RangeInput
          type="range"
          value={top}
          onInput={onChangeTop}
          min={-100}
          max={100}
          step={0.01}
        />
        {`top: ${top}%`}
        <RangeInput
          type="range"
          value={rotation}
          onInput={onChangeRotation}
          min={-100}
          max={100}
          step={0.01}
        />
        {`rotation: ${rotation}%`}
        <Button onClick={next}>확인</Button>
      </Tool>
    </Wrapper>
  );
}

const Wrapper = tw.div`
absolute
top-0
left-0
w-full
h-full
flex
overflow-hidden
`;

const Container = tw.div`
w-[1000px]
h-[1000px]
`;

const Tool = tw.div``;

const HeadImg = tw.img`
z-10
absolute
`;

const RangeInput = tw.input`
w-full
`;

const Button = tw.button`
block
border
border-slate-900
py-2
px-4
`;
