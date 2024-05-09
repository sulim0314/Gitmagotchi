import { useEffect, useRef } from "react";
import tw from "tailwind-styled-components";
import "./BrokenHeart.css";

export default function BrokenHeart() {
  const hrt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      toggle();
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const toggle = function () {
    if (!hrt.current) return;
    if (hrt.current.getAttribute("aria-checked") === "true") {
      hrt.current.setAttribute("aria-checked", "false");
    } else {
      hrt.current.setAttribute("aria-checked", "true");
    }
  };

  return (
    <Wrapper>
      <div
        ref={hrt}
        className="heart-Circle"
        style={{ margin: "0 auto" }}
        aria-checked={false}
        aria-labelledby="label"
        tabIndex={0}
      >
        <div className="heart-Container">
          <div className="left-Side sides">
            <div className="half">
              <div className="heart"></div>
            </div>

            <div className="points">
              <div className="point pt1"></div>
              <div className="point pt4"></div>
              <div className="point pt2"></div>
              <div className="point pt3"></div>
            </div>
          </div>

          <div className="right-Side sides">
            <div className="half">
              <div className="heart"></div>
            </div>

            <div className="points">
              <div className="point pt1"></div>
              <div className="point pt2"></div>
              <div className="point pt3"></div>
            </div>
          </div>
        </div>
      </div>{" "}
    </Wrapper>
  );
}
const Wrapper = tw.div`
w-full
h-full
`;
