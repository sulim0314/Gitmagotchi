import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import SampleFaceImage from "@/assets/images/sampleFace.png";
import { FaRegCommentDots } from "react-icons/fa";
import MeatImage from "@/assets/images/meat.png";
import CoinImage from "@/assets/images/coin.png";
import PlayImage from "@/assets/images/play.png";
import interactionEatImage from "@/assets/images/interactionEat.png";
import interactionRunImage from "@/assets/images/interactionRun.png";
import interactionShowerImage from "@/assets/images/interactionShower.png";
import interactionGameImage from "@/assets/images/interactionGame.png";
import sampleSpritesheetImage from "@/assets/images/sampleSpritesheet.png";
import { VscRefresh } from "react-icons/vsc";
import { HiPlusCircle, HiHeart } from "react-icons/hi";
import { LuBatteryFull } from "react-icons/lu";
import { BsStars } from "react-icons/bs";
import Spritesheet from "react-responsive-spritesheet";

export default function Home() {
  const navigate = useNavigate();
  const spritesheet = useRef<Spritesheet | null>(null);

  useEffect(() => {
    if (false) {
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <Wrapper>
      <Header>
        <LeftHeader>
          <InfoContianer>
            <Link to={"/character"}>
              <img src={SampleFaceImage} className="w-16" />
            </Link>
            <CharacterInfo>
              <Link to={"/character"}>
                <CharacterLevel>LV.9</CharacterLevel>
              </Link>
              <NameContainer>
                <Link to={"/character"}>
                  <CharacterName>도날드덕</CharacterName>
                </Link>
                <Link to={"/character/chat"}>
                  <ChatIcon />
                </Link>
              </NameContainer>
            </CharacterInfo>
          </InfoContianer>
          <ExpContainer>
            <ExpBarContainer>
              <ExpBar />
              <ExpText>60 / 100</ExpText>
            </ExpBarContainer>
          </ExpContainer>
          <StatContainer>
            <StatRow>
              <BatteryIcon />
              <StatBarContainer className="bg-red-400/50">
                <StatBar className="bg-red-500" />
              </StatBarContainer>
            </StatRow>
            <StatRow>
              <HeartIcon />
              <StatBarContainer className="bg-amber-400/50">
                <StatBar className="bg-amber-500" />
              </StatBarContainer>
            </StatRow>
            <StatRow>
              <ShineIcon />
              <StatBarContainer className="bg-blue-400/50">
                <StatBar className="bg-blue-500" />
              </StatBarContainer>
            </StatRow>
          </StatContainer>
          <img
            src={PlayImage}
            className="w-16 cursor-pointer"
            onClick={() => {
              if (spritesheet.current) {
                spritesheet.current.play();
              }
            }}
          />
        </LeftHeader>
        <RightHeader>
          <PropertyList>
            <PropertyContainer>
              <img src={CoinImage} className="w-8" />
              <PropertyNumber>200</PropertyNumber>
            </PropertyContainer>
            <PropertyContainer>
              <img src={MeatImage} className="w-8" />
              <PropertyNumber>7</PropertyNumber>
              <RefreshIcon />
            </PropertyContainer>
          </PropertyList>
        </RightHeader>
      </Header>

      <MainContainer>
        <CharacterCanvasContainer>
          <CharacterCanvas
            image={sampleSpritesheetImage}
            widthFrame={500}
            heightFrame={500}
            steps={339}
            fps={30}
            autoplay={true}
            loop={false}
            direction="forward"
            backgroundSize={`cover`}
            backgroundRepeat={`no-repeat`}
            backgroundPosition={`center center`}
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
        </CharacterCanvasContainer>
        <InteractionContainer>
          <InteractionButton>
            <img src={interactionEatImage} />
          </InteractionButton>
          <InteractionButton>
            <img src={interactionRunImage} />
          </InteractionButton>
          <InteractionButton>
            <img src={interactionShowerImage} />
          </InteractionButton>
          <InteractionButton>
            <img src={interactionGameImage} />
          </InteractionButton>
        </InteractionContainer>
      </MainContainer>
      <ServerMsgContainer>
        <ServerMsgBox>
          <ServerMsg>밥을 먹어 포만감이 상승했습니다. (EXP +3)</ServerMsg>
          <PlusIcon />
        </ServerMsgBox>
      </ServerMsgContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
relative
flex
flex-col
`;

const Header = tw.div`
absolute
-top-24
lg:top-0
w-full
h-48
py-2
px-6
flex
justify-between
items-end
lg:items-start
z-10
`;

const LeftHeader = tw.div`
flex-grow
`;

const InfoContianer = tw.div`
flex
space-x-2
items-start
`;

const CharacterInfo = tw.div`
h-full
w-20
pt-3
flex
flex-col
space-y-1
flex-grow
`;

const CharacterLevel = tw.h3`
text-sm
`;

const NameContainer = tw.div`
flex
items-center
space-x-4
`;

const CharacterName = tw.h1`
text-xl
`;

const ChatIcon = tw(FaRegCommentDots)`
w-6
h-6
cursor-pointer
`;

const ExpContainer = tw.div`
w-full
p-2
`;

const ExpBarContainer = tw.div`
w-48
h-3
bg-green-400/50
rounded-lg
shadow-md
flex
justify-center
items-center
relative
`;

const ExpBar = tw.div`
absolute
top-0
left-0
bg-green-500
w-3/5
h-full
rounded-lg
`;

const ExpText = tw.p`
text-xs
z-10
text-slate-100
`;

const RightHeader = tw.div`
w-20
h-34
pt-4
flex
justify-between
items-end
`;

const PropertyList = tw.div`
flex
flex-col
space-y-2
`;

const PropertyContainer = tw.div`
flex
items-center
space-x-2
`;

const PropertyNumber = tw.h2``;

const RefreshIcon = tw(VscRefresh)`
w-6
h-6
text-slate-500
cursor-pointer
`;

const MainContainer = tw.div`
w-full
h-10
flex-grow
flex
flex-col
justify-center
items-center
relative
`;

const InteractionContainer = tw.div`
w-full
h-14
absolute
lg:fixed
bottom-6
flex
justify-end
px-8
space-x-4
`;

const InteractionButton = tw.div`
w-14
h-14
bg-slate-300
border-2
border-slate-200/70
shadow-xl
rounded-lg
cursor-pointer
p-1
`;

const ServerMsgContainer = tw.div`
w-full
lg:w-1/3
lg:px-8
lg:py-4
lg:rounded-2xl
z-10
`;

const ServerMsgBox = tw.div`
w-full
lg:rounded-2xl
h-8
flex
justify-between
items-center
px-4
bg-gray-900/30
`;

const ServerMsg = tw.p`
text-slate-200
text-sm
`;

const PlusIcon = tw(HiPlusCircle)`
w-4
h-4
text-slate-200
cursor-pointer
`;

const StatContainer = tw.div`
hidden
w-full
h-20
lg:flex
flex-col
space-y-1
pl-2
py-2
`;

const StatRow = tw.div`
flex
items-center
space-x-2
`;

const StatBarContainer = tw.div`
w-36
h-2
rounded-lg
shadow-md
flex
justify-center
items-center
relative
`;

const StatBar = tw.div`
absolute
top-0
left-0
w-3/5
h-full
rounded-lg
`;

const BatteryIcon = tw(LuBatteryFull)`
w-4
h-4
`;

const HeartIcon = tw(HiHeart)`
w-4
h-4
`;

const ShineIcon = tw(BsStars)`
w-4
h-4
`;

const CharacterCanvasContainer = tw.div`
w-80
lg:w-[30rem]
aspect-square
relative
overflow-hidden
`;

const CharacterCanvas = tw(Spritesheet)`
w-full
h-full
absolute
top-1/2
left-1/2
-translate-x-1/2
-translate-y-1/3
scale-110
lg:scale-125
`;
