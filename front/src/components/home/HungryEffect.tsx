import { useEffect, useRef } from "react";
import tw from "tailwind-styled-components";

export default function HungryEffect() {
  const pathRef1 = useRef<SVGPathElement>(null);
  const pathRef2 = useRef<SVGPathElement>(null);
  const pathRef3 = useRef<SVGPathElement>(null);
  useEffect(() => {
    const xs: number[] = [];
    for (let i = 0; i <= 60; i++) {
      xs.push(i);
    }

    let t = 0;

    function animate() {
      const points = xs.map((x) => {
        const y = 25 + 5 * Math.sin((x + t) / 5);

        return [x, y];
      });

      const path =
        "M" +
        points
          .map((p) => {
            return p[0] + "," + p[1];
          })
          .join("L");

      pathRef1.current!.setAttribute("d", path);
      pathRef2.current!.setAttribute("d", path);
      pathRef3.current!.setAttribute("d", path);

      t += 1;

      requestAnimationFrame(animate);
    }

    animate();
  }, []);
  return (
    <Wrapper>
      <EffectSvg className="rotate-[10deg]">
        <EffectPath style={{ strokeLinecap: "round" }} ref={pathRef1} d="M10,10 L50, 100 L90,50" />
      </EffectSvg>
      <EffectSvg className="rotate-[30deg]">
        <EffectPath style={{ strokeLinecap: "round" }} ref={pathRef2} d="M10,10 L50, 100 L90,50" />
      </EffectSvg>
      <EffectSvg className="rotate-[50deg]">
        <EffectPath style={{ strokeLinecap: "round" }} ref={pathRef3} d="M10,10 L50, 100 L90,50" />
      </EffectSvg>
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
justify-center
items-center
`;

const EffectSvg = tw.svg`
w-[100px]
h-[50px]
absolute
top-1/2
left-1/2
-translate-x-[80%]
translate-y-1/4
origin-right
pr-8
`;

const EffectPath = tw.path`
stroke-[8px]
fill-none
stroke-orange-400

`;
