import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import SampleFaceImage from "@/assets/images/sampleFace.png";
import { FaRegCommentDots } from "react-icons/fa";
import MeatImage from "@/assets/images/meat.png";
import CoinImage from "@/assets/images/coin.png";
import PlayImage from "@/assets/images/play.png";
import sampleCharacter2Image from "@/assets/images/sampleCharacter2.png";
import interactionEatImage from "@/assets/images/interactionEat.png";
import interactionRunImage from "@/assets/images/interactionRun.png";
import interactionShowerImage from "@/assets/images/interactionShower.png";
import interactionGameImage from "@/assets/images/interactionGame.png";
import { VscRefresh } from "react-icons/vsc";
import { HiPlusCircle } from "react-icons/hi";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (false) {
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <Wrapper>
      <Header>
        <InfoContianer>
          <img src={SampleFaceImage} className="w-16" />
          <CharacterInfo>
            <CharacterLevel>LV.9</CharacterLevel>
            <NameContainer>
              <CharacterName>도날드덕</CharacterName>
              <ChatIcon />
            </NameContainer>
          </CharacterInfo>
        </InfoContianer>
        <ExpContainer>
          <ExpBarContainer>
            <ExpBar />
            <ExpText>60 / 100</ExpText>
          </ExpBarContainer>
        </ExpContainer>
      </Header>
      <TopContainer>
        <img src={PlayImage} className="w-16 cursor-pointer" />
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
      </TopContainer>
      <MainContainer>
        <img src={sampleCharacter2Image} className="w-3/5" />
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
        <ServerMsg>밥을 먹어 포만감이 상승했습니다. (EXP +3)</ServerMsg>
        <PlusIcon />
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
-top-20
w-3/4
h-28
py-2
px-6
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

const TopContainer = tw.div`
w-full
h-34
pt-10
px-8
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
