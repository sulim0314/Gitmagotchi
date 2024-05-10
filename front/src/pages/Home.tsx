import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import { FaRegCommentDots } from "react-icons/fa";
import MeatImage from "@/assets/images/meat.svg";
import CoinImage from "@/assets/images/coin.svg";
import PlayImage from "@/assets/images/play.svg";
import interactionEatImage from "@/assets/images/eat.svg";
import interactionRunImage from "@/assets/images/walk.svg";
import interactionShowerImage from "@/assets/images/shower.svg";
import interactionGameImage from "@/assets/images/game.svg";
import sampleSpritesheetImage from "@/assets/images/sampleSpritesheet.png";
import { VscRefresh } from "react-icons/vsc";
import { HiPlusCircle, HiHeart } from "react-icons/hi";
import { IoMdClose, IoIosLock } from "react-icons/io";
import { LuBatteryFull } from "react-icons/lu";
import { BsStars } from "react-icons/bs";
import Spritesheet from "react-responsive-spritesheet";
import Modal from "react-modal";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataAtom } from "@/store/user";
import { characterDataAtom } from "@/store/character";
import { messageDataAtom } from "@/store/message";
import FlyingFly from "@/components/home/FlyingFly";
import BrokenHeart from "@/components/home/BrokenHeart";
import HungryEffect from "@/components/home/HungryEffect";
import { expHandler, interactionMessage, statusHandler } from "@/util/value";
import { useMutation } from "@tanstack/react-query";
import { getInteractionResult } from "@/api/character";
import { InteractType } from "@/models";

export default function Home() {
  const navigate = useNavigate();
  const userData = useRecoilValue(userDataAtom);
  const [characterData, setCharacterData] = useRecoilState(characterDataAtom);
  const [messageData, setMessageData] = useRecoilState(messageDataAtom);
  const spritesheet = useRef<Spritesheet | null>(null);
  const modalBottomRef = useRef<HTMLDivElement>(null);
  const levelupRef = useRef<HTMLDivElement>(null);
  const [msgModal, setMsgModal] = useState<boolean>(false);
  const [animModal, setAnimModal] = useState<boolean>(false);

  const interactionMution = useMutation({
    mutationFn: getInteractionResult,
    onSuccess: (data) => {
      if (expHandler(data.exp || 0).level > expHandler(characterData?.exp || 0).level) {
        levelUpEffect(expHandler(data.exp || 0).level);
      }
      setMessageData((prev) => [
        ...prev,
        {
          timestamp: new Date().toString(),
          text: interactionMessage(data.interactType, data.exp - (characterData?.exp || 0)),
        },
      ]);
      setCharacterData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          exp: data.exp,
          status: {
            cleanness: data.cleanness,
            fullness: data.fullness,
            intimacy: data.intimacy,
          },
        };
      });
    },
    onError: (err) => console.log(err),
  });

  useEffect(() => {
    modalBottomRef.current?.scrollIntoView();
  }, [msgModal, messageData, modalBottomRef]);

  const toggleMsgModal = () => {
    setMsgModal(!msgModal);
  };

  const toggleAnimModal = () => {
    setAnimModal(!animModal);
  };

  const formatTimestamp = (date: string) => {
    const d = new Date(date);
    const hour = d.getHours();
    const minute = d.getMinutes();
    return `[${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}] `;
  };

  const playAnimation = () => {
    return () => {
      setAnimModal(false);
      if (spritesheet.current) {
        spritesheet.current.play();
      }
    };
  };

  const handleInteraction = (type: InteractType) => {
    return () => {
      interactionMution.mutate({
        body: JSON.stringify({
          exp: characterData?.exp,
          interactType: type,
          status: {
            fullness: characterData?.status.fullness,
            intimacy: characterData?.status.intimacy,
            cleanness: characterData?.status.cleanness,
          },
          stat: {
            fullnessStat: characterData?.stat.fullnessStat,
            intimacyStat: characterData?.stat.intimacyStat,
          },
        }),
      });
    };
  };

  const levelUpEffect = (level: number) => {
    const keyframes: Keyframe[] = [
      { opacity: 0, transform: "translate(0, 10px)", scale: 1 },
      { opacity: 1, transform: "translate(0, 0px)", scale: 1.05 },
      { opacity: 1, transform: "translate(0, -10px)", scale: 1.1 },
      { opacity: 1, transform: "translate(0, -20px)", scale: 1.15 },
      { opacity: 1, transform: "translate(0, -30px)", scale: 1.2 },
      { opacity: 0, transform: "translate(0, -40px)", scale: 1.25 },
    ];
    const options: KeyframeAnimationOptions = {
      delay: 300,
      duration: 2000,
      easing: "ease-in-out",
    };
    levelupRef.current?.animate(keyframes, options);
    setMessageData((prev) => [
      ...prev,
      {
        timestamp: new Date().toString(),
        text: `레벨이 ${level}로 올랐습니다.`,
      },
    ]);
  };

  return (
    <Wrapper>
      <Header>
        <LeftHeader>
          <InfoContianer>
            <Link to={"/character"}>
              <img
                src={characterData?.faceUrl}
                className="w-16 h-16 group-hover:scale-110 transition-all"
              />
            </Link>
            <CharacterInfo>
              <Link to={"/character"}>
                <CharacterLevel>{`LV.${expHandler(characterData?.exp || 0).level}`}</CharacterLevel>
              </Link>
              <NameContainer>
                <Link to={"/character"}>
                  <CharacterName>{characterData?.name}</CharacterName>
                </Link>
                <Link to={"/character/chat"}>
                  <ChatIcon />
                </Link>
              </NameContainer>
            </CharacterInfo>
          </InfoContianer>
          <ExpContainer className="text-border">
            <ExpBarContainer>
              <ExpBar style={{ width: `${expHandler(characterData?.exp || 0).percentage}%` }} />
              <ExpText>{`${expHandler(characterData?.exp || 0).curExp} / ${
                expHandler(characterData?.exp || 0).maxExp
              }`}</ExpText>
            </ExpBarContainer>
          </ExpContainer>
          <StatContainer>
            <StatRow>
              <BatteryIcon />
              <StatBarContainer className="bg-red-400/50">
                <StatBar
                  className="bg-red-500"
                  style={{
                    width: `${(
                      ((characterData?.status.fullness || 0) /
                        statusHandler(
                          expHandler(characterData?.exp || 0).level,
                          characterData?.stat.intimacyStat || 1
                        ).fullnessMax) *
                      100
                    ).toFixed(2)}%`,
                  }}
                />
              </StatBarContainer>
            </StatRow>
            <StatRow>
              <HeartIcon />
              <StatBarContainer className="bg-amber-400/50">
                <StatBar
                  className="bg-amber-500"
                  style={{
                    width: `${(
                      ((characterData?.status.intimacy || 0) /
                        statusHandler(
                          expHandler(characterData?.exp || 0).level,
                          characterData?.stat.intimacyStat || 1
                        ).intimacyMax) *
                      100
                    ).toFixed(2)}%`,
                  }}
                />
              </StatBarContainer>
            </StatRow>
            <StatRow>
              <ShineIcon />
              <StatBarContainer className="bg-blue-400/50">
                <StatBar
                  className="bg-blue-500"
                  style={{
                    width: `${(
                      ((characterData?.status.cleanness || 0) /
                        statusHandler(
                          expHandler(characterData?.exp || 0).level,
                          characterData?.stat.intimacyStat || 1
                        ).cleannessMax) *
                      100
                    ).toFixed(2)}%`,
                  }}
                />
              </StatBarContainer>
            </StatRow>
          </StatContainer>
          <PlayIcon src={PlayImage} onClick={toggleAnimModal} />
        </LeftHeader>
        <RightHeader>
          <PropertyList>
            <PropertyContainer>
              <img src={CoinImage} className="w-8 h-8 bg-center" />
              <PropertyNumber>{userData?.gold}</PropertyNumber>
            </PropertyContainer>
            <PropertyContainer>
              <img src={MeatImage} className="w-8 h-8 bg-center" />
              <PropertyNumber>{userData?.meal}</PropertyNumber>
              <RefreshIcon />
            </PropertyContainer>
          </PropertyList>
        </RightHeader>
      </Header>

      <MainContainer>
        <CharacterCanvasContainer>
          <CharacterCanvas
            image={sampleSpritesheetImage}
            widthFrame={1000}
            heightFrame={1000}
            steps={339}
            fps={30}
            autoplay={true}
            loop={false}
            direction="forward"
            backgroundSize={`cover`}
            backgroundRepeat={`no-repeat`}
            backgroundPosition={`center center`}
            isResponsive={true}
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
          <EffectContainer>
            {characterData && characterData.status.fullness < 50 && (
              <FlyingFlyContainer>
                <FlyingFly />
              </FlyingFlyContainer>
            )}
            {characterData && characterData.status.intimacy < 50 && (
              <BrokenHeartContainer>
                <BrokenHeart />
              </BrokenHeartContainer>
            )}
            {characterData && characterData.status.fullness < 50 && (
              <HungryEffectContainer>
                <HungryEffect />
              </HungryEffectContainer>
            )}
            <LevelupText ref={levelupRef}>LEVEL UP</LevelupText>
          </EffectContainer>
        </CharacterCanvasContainer>
        <InteractionContainer>
          <InteractionButton onClick={handleInteraction("EAT")}>
            <img src={interactionEatImage} className="h-10 bg-cover" />
          </InteractionButton>
          <InteractionButton onClick={handleInteraction("WALK")}>
            <img src={interactionRunImage} className="h-10 bg-cover" />
          </InteractionButton>
          <InteractionButton onClick={handleInteraction("SHOWER")}>
            <img src={interactionShowerImage} className="h-10 bg-cover" />
          </InteractionButton>
          <InteractionButton onClick={() => navigate("/character/game")}>
            <img src={interactionGameImage} className="w-10 bg-cover" />
          </InteractionButton>
        </InteractionContainer>
      </MainContainer>
      <ServerMsgContainer>
        <ServerMsgBox onClick={toggleMsgModal}>
          <ServerMsg>{messageData[messageData.length - 1].text}</ServerMsg>
          <PlusIcon />
        </ServerMsgBox>
      </ServerMsgContainer>
      <CustomModal
        style={customModalStyles}
        isOpen={msgModal}
        onRequestClose={() => setMsgModal(false)}
        ariaHideApp={false}
        contentLabel="서버 메시지"
        shouldCloseOnOverlayClick={true}
        onAfterOpen={() => modalBottomRef.current?.scrollIntoView()}
      >
        <ModalTitleContainer>
          <ModalTitle>서버 메시지</ModalTitle>
          <ModalCloseButton onClick={toggleMsgModal} />
        </ModalTitleContainer>
        <ModalMsgList>
          {messageData.map((msg, i) => (
            <ModalMsg key={msg.timestamp + i}>
              <ModalMsgTimestamp>{formatTimestamp(msg.timestamp)}</ModalMsgTimestamp>
              {msg.text}
            </ModalMsg>
          ))}
          <div ref={modalBottomRef} />
        </ModalMsgList>
      </CustomModal>
      <CustomModal
        style={customModalStyles}
        isOpen={animModal}
        onRequestClose={() => setAnimModal(false)}
        ariaHideApp={false}
        contentLabel="애니메이션 목록"
        shouldCloseOnOverlayClick={true}
      >
        <ModalTitleContainer>
          <ModalTitle>애니메이션 목록</ModalTitle>
          <ModalCloseButton onClick={toggleAnimModal} />
        </ModalTitleContainer>
        <AnimGrid>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <AnimContainer key={i}>
              <AnimButton onClick={playAnimation()}>춤추기</AnimButton>
              {i !== 1 && (
                <AnimDisabled>
                  <LockIcon />
                </AnimDisabled>
              )}
            </AnimContainer>
          ))}
        </AnimGrid>
      </CustomModal>
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
group
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

const PlayIcon = tw.img`
w-16
rounded-full
shadow-lg
border-2
border-slate-800
cursor-pointer
hover:saturate-200
hover:scale-125
transition-all
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
border-2
border-slate-500
relative
`;

const ExpBar = tw.div`
absolute
top-0
left-0
bg-green-500
h-full
rounded-lg
transition-all
duration-1000
`;

const ExpText = tw.p`
text-xs
z-10
text-slate-100
font-semibold
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

const PropertyNumber = tw.h2`
font-semibold
text-base
lg:text-xl
`;

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
bg-purple-50
hover:bg-purple-100
hover:scale-125
transition-all
border-2
border-slate-800
shadow-xl
rounded-lg
cursor-pointer
p-2
flex
justify-center
items-center
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
lg:border-2
border-slate-800
h-8
flex
justify-between
items-center
px-4
bg-gray-900/30
hover:bg-gray-900/50
transition-all
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
border-2
border-slate-500
`;

const StatBar = tw.div`
absolute
top-0
left-0
h-full
rounded-lg
transition-all
duration-1000
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
max-w-full
max-h-full
absolute
aspect-square
`;

const EffectContainer = tw.div`
absolute
w-full
h-full
top-0
left-0
flex
justify-center
`;

const FlyingFlyContainer = tw.div`
absolute
top-0
left-0
w-full
h-full
`;

const BrokenHeartContainer = tw.div`
absolute
top-0
left-0
w-full
h-full
flex
justify-center
`;

const HungryEffectContainer = tw.div`
absolute
w-full
h-full
left-0
top-0
`;

const LevelupText = tw.div`
opacity-0
text-3xl
font-bold
text-green-600
`;

const CharacterCanvas = tw(Spritesheet)`
w-full
h-full
translate-y-10
`;

const CustomModal = tw(Modal)`
w-80
h-80
lg:w-[30rem]
lg:h-[30rem]
bg-slate-50
rounded-xl
border-2
border-slate-800
absolute
z-50
top-1/2
left-1/2
-translate-x-1/2
-translate-y-1/2
flex
flex-col
`;

const ModalTitleContainer = tw.div`
w-full
flex
justify-between
p-4
`;

const ModalTitle = tw.div`
font-bold
text-xl
`;

const ModalMsgList = tw.div`
w-full
h-20
flex-grow
overflow-y-scroll
p-4
`;

const ModalMsg = tw.p`
p-2
`;

const ModalMsgTimestamp = tw.span`
font-bold
text-slate-500
mr-4
`;

const ModalCloseButton = tw(IoMdClose)`
w-6
h-6
cursor-pointer
`;

const AnimGrid = tw.div`
w-full
h-20
flex-grow
p-4
grid
grid-cols-3
grid-rows-3
gap-2
`;

const AnimContainer = tw.div`

relative
`;

const AnimButton = tw.div`
bg-orange-400
w-full
h-full
flex
justify-center
items-center
cursor-pointer
`;

const AnimDisabled = tw.div`
absolute
top-0
left-0
w-full
h-full
bg-slate-50/70
flex
justify-center
items-center
`;

const LockIcon = tw(IoIosLock)`
w-10
h-10
text-slate-400
`;

const customModalStyles: ReactModal.Styles = {
  overlay: {
    backgroundColor: " rgba(0, 0, 0, 0.4)",
    width: "100%",
    height: "100vh",
    zIndex: "10",
    position: "fixed",
    top: "0",
    left: "0",
  },
};
