import tw from "tailwind-styled-components";
import "./FlyingFly.css";

export default function FlyingFly() {
  return (
    <Wrapper>
      <div id="emptySeccCont">
        <div className="flyRute" id="flyRute1">
          <div className="flyCont">
            <div id="flyWingCont">
              <div id="fly"></div>
              <div className="flyWing"></div>
              <div className="flyWing"></div>
            </div>
          </div>
        </div>
        <div className="flyRute" id="flyRute2">
          <div className="flyCont">
            <div id="flyWingCont">
              <div id="fly"></div>
              <div className="flyWing"></div>
              <div className="flyWing"></div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
`;
