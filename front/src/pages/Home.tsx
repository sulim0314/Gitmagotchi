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
import { createAnimation, getInteractionResult } from "@/api/character";
import { IAnimation, InteractType } from "@/models";
import BabyImgFrame from "@/assets/images/baby.svg";
import RefreshImage from "@/assets/images/refresh.svg";
import { eatMeal, getMeal } from "@/api/user";
import { motionDataAtom } from "@/store/motion";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useRecoilState(userDataAtom);
  const [characterData, setCharacterData] = useRecoilState(characterDataAtom);
  const [messageData, setMessageData] = useRecoilState(messageDataAtom);
  const motionData = useRecoilValue(motionDataAtom);
  const spritesheet = useRef<Spritesheet | null>(null);
  const modalBottomRef = useRef<HTMLDivElement>(null);
  const levelupRef = useRef<HTMLDivElement>(null);
  const messageBarRef = useRef<HTMLDivElement>(null);
  const [msgModal, setMsgModal] = useState<boolean>(false);
  const [animModal, setAnimModal] = useState<boolean>(false);

  const mealRef = useRef<HTMLImageElement>(null);
  const mealAnimationRef = useRef<Animation>(new Animation());

  const spriteRef = useRef<HTMLImageElement>(new Image());
  const [spriteLoaded, setSpriteLoaded] = useState<boolean>(false);
  const [currentSprite, setCurrentSprite] = useState<IAnimation | null>(null);

  const interactionMution = useMutation({
    mutationFn: getInteractionResult,
    onSuccess: (data) => {
      if (!characterData) return;
      if (
        expHandler(data.exp || 0).level > expHandler(characterData.exp).level
      ) {
        levelUpEffect(expHandler(data.exp || 0).level);
        createAnimation({
          characterId: characterData.characterId,
          requiredLevel: expHandler(data.exp || 0).level,
        });
      }
      addMessage(
        interactionMessage(data.interactType, data.exp - characterData.exp)
      );
      setCharacterData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          exp: data.exp,
          stat: {
            ...prev.stat,
            unusedStat:
              expHandler(data.exp || 0).level >
              expHandler(characterData.exp).level
                ? prev.stat.unusedStat + 1
                : prev.stat.unusedStat,
          },
          status: {
            cleanness: data.cleanness,
            fullness: data.fullness,
            intimacy: data.intimacy,
          },
        };
      });
    },
    onError: () => addMessage("캐릭터와 상호작용 하는데에 문제가 생겼습니다."),
  });

  const mealMutation = useMutation({
    mutationFn: getMeal,
    onSuccess: (data) => {
      console.log(data.message);
      addMessage(
        `${userData?.githubUsername}의 깃허브에서 ${data.value}개의 커밋을 가져와 밥을 지었습니다.`
      );
      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          meal: prev.meal + data.value,
        };
      });
    },
    onError: () => addMessage("지금은 밥을 지을 수 없습니다."),
  });

  const eatMutation = useMutation({
    mutationFn: eatMeal,
    onSuccess: (data) => {
      console.log(data);
      setUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, meal: data.meal };
      });
      handleInteraction("EAT")();
    },
    onError: () => addMessage("밥이 없어 밥을 먹을 수 없습니다."),
  });

  useEffect(() => {
    if (motionData) {
      setCurrentSprite(motionData.hello);
    }
  }, [motionData]);

  useEffect(() => {
    if (!currentSprite || !spriteRef.current) return;
    if (spritesheet.current) {
      spritesheet.current.goToAndPause(1);
    }
    spriteRef.current.src = currentSprite?.motion;
    spriteRef.current.onload = () => {
      setSpriteLoaded(true);
      if (spritesheet.current) {
        spritesheet.current.goToAndPlay(1);
      }
    };
  }, [currentSprite]);

  useEffect(() => {
    modalBottomRef.current?.scrollIntoView();
  }, [msgModal, messageData, modalBottomRef]);

  useEffect(() => {
    const keyframes: Keyframe[] = [
      { backgroundColor: "rgb(17 24 39 / 0.9)" },
      { backgroundColor: "rgb(17 24 39 / 0.3)" },
    ];
    const options: KeyframeAnimationOptions = {
      delay: 300,
      duration: 1000,
      easing: "ease-in-out",
    };
    messageBarRef.current?.animate(keyframes, options);
  }, [messageData]);

  const toggleMsgModal = () => {
    setMsgModal(!msgModal);
  };

  const toggleAnimModal = () => {
    setAnimModal(!animModal);
  };

  const addMessage = (text: string) => {
    setMessageData((prev) => [
      ...prev,
      {
        timestamp: new Date().toString(),
        text,
      },
    ]);
  };

  const formatTimestamp = (date: string) => {
    const d = new Date(date);
    const hour = d.getHours();
    const minute = d.getMinutes();
    return `[${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}] `;
  };

  const playAnimation = (i: number) => {
    return () => {
      if (!motionData) return;
      setCurrentSprite(motionData.motion[i]);
      setAnimModal(false);
    };
  };

  const handleInteraction = (type: InteractType) => {
    return () => {
      if (type === "EAT") {
        if (motionData) {
          setCurrentSprite(motionData.meal);
        }
        if (
          (characterData?.status.fullness || 0) ===
          statusHandler(characterData).fullnessMax
        ) {
          addMessage("배가 불러 더이상 밥을 먹을 수 없습니다.");
          return;
        }
      }
      if (type === "WALK") {
        if (motionData) {
          setCurrentSprite(motionData.walk);
        }
        if (
          (characterData?.status.intimacy || 0) ===
          statusHandler(characterData).intimacyMax
        ) {
          addMessage("이미 친밀도가 최대치라서 산책하고 싶지 않아 합니다.");
          return;
        }
      }
      if (type === "SHOWER") {
        if (motionData) {
          setCurrentSprite(motionData.shower);
        }
        if (
          (characterData?.status.cleanness || 0) ===
          statusHandler(characterData).cleannessMax
        ) {
          addMessage("이미 깨끗해 샤워하고 싶지 않아 합니다.");
          return;
        }
      }

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

  useEffect(() => {
    if (mealMutation.isPending) {
      const keyframes: Keyframe[] = [
        { transform: "rotate(0deg)" },
        { transform: "rotate(90deg)" },
        { transform: "rotate(180deg)" },
      ];
      const options: KeyframeAnimationOptions = {
        delay: 2000,
        duration: 820,
        easing: "ease-in-out",
        fill: "both",
        iterations: Infinity,
      };

      mealAnimationRef.current =
        mealRef.current?.animate(keyframes, options) || new Animation();
    } else {
      mealAnimationRef.current.cancel();
    }
  }, [mealMutation.isPending]);

  const onPauseAnimation = () => {
    if (spritesheet.current && motionData) {
      if (Math.random() > 0.2) {
        if (currentSprite?.frames !== motionData.default.frames) {
          setCurrentSprite(motionData.default);
        }
      } else {
        setCurrentSprite(
          motionData.motion[
            Math.floor(Math.random() * motionData.motion.length)
          ]
        );
      }
    }
  };

  const onPlayAnimation = () => {
    if (spritesheet.current && currentSprite) {
      spritesheet.current.setEndAt(currentSprite.frames);
    }
  };

  if (!characterData || !userData) return null;

  return (
    <Wrapper>
      <Header>
        <LeftHeader>
          <InfoContianer className="text-border">
            <Link to={"/character"}>
              <FaceContainer>
                <FaceImg src={characterData.faceUrl} />
              </FaceContainer>
            </Link>
            <CharacterInfo>
              <Link to={"/character"}>
                <CharacterLevel>{`LV.${
                  expHandler(characterData.exp).level
                }`}</CharacterLevel>
              </Link>
              <NameContainer>
                <Link to={"/character"}>
                  <CharacterName>{characterData.name}</CharacterName>
                </Link>
                <Link
                  to={"/character/chat"}
                  className="bg-[#f2f2f2] rounded-full p-2 border-2 border-slate-800"
                >
                  <ChatIcon />
                </Link>
              </NameContainer>
            </CharacterInfo>
          </InfoContianer>
          <ExpContainer className="text-border">
            <ExpBarContainer>
              <ExpBar
                style={{
                  width: `${expHandler(characterData.exp).percentage}%`,
                }}
              />
              <ExpText>{`${expHandler(characterData.exp).curExp} / ${
                expHandler(characterData.exp).maxExp
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
                      (characterData.status.fullness /
                        statusHandler(characterData).fullnessMax) *
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
                      (characterData.status.intimacy /
                        statusHandler(characterData).intimacyMax) *
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
                      (characterData.status.cleanness /
                        statusHandler(characterData).cleannessMax) *
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
          <PropertyList className="text-border">
            <PropertyContainer>
              <img src={CoinImage} className="w-8 h-8 bg-center" />
              <PropertyNumber>{userData.gold}</PropertyNumber>
            </PropertyContainer>
            <PropertyVertical>
              <PropertyContainer>
                <img src={MeatImage} className="w-8 h-8 bg-center" />
                <PropertyNumber>{userData.meal}</PropertyNumber>
                {mealMutation.isPending ? (
                  <RefreshIcon
                    src={RefreshImage}
                    className="cursor-default"
                    ref={mealRef}
                  />
                ) : (
                  <RefreshIcon
                    src={RefreshImage}
                    onClick={() => mealMutation.mutate()}
                  />
                )}
              </PropertyContainer>
              <MealMsg>
                커밋을 가져와
                <br />
                밥을 지어요.
              </MealMsg>
            </PropertyVertical>
          </PropertyList>
        </RightHeader>
      </Header>

      <MainContainer>
        <CharacterCanvasContainer>
          {motionData && motionData.motion.length > 0 ? (
            <AnimatePresence initial={false}>
              {motionData && currentSprite && spriteLoaded && (
                <motion.div
                  key={currentSprite.frames + new Date().valueOf()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <CharacterCanvas
                    image={currentSprite.motion}
                    widthFrame={500}
                    heightFrame={500}
                    steps={1000}
                    fps={30}
                    autoplay={true}
                    loop={true}
                    endAt={330}
                    direction="forward"
                    backgroundSize={`cover`}
                    backgroundRepeat={`no-repeat`}
                    backgroundPosition={`center center`}
                    isResponsive={true}
                    getInstance={(s) => {
                      spritesheet.current = s;
                    }}
                    onPlay={onPlayAnimation}
                    onLoopComplete={onPauseAnimation}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <ImgContainer>
              <BabyImg src={BabyImgFrame} />
              <BabyFaceImg src={characterData?.faceUrl} />
            </ImgContainer>
          )}
          <EffectContainer className="text-border">
            {characterData &&
              spriteLoaded &&
              characterData.status.cleanness <
                statusHandler(characterData).cleannessMax / 2 && (
                <FlyingFlyContainer>
                  <FlyingFly />
                </FlyingFlyContainer>
              )}
            {characterData &&
              spriteLoaded &&
              characterData.status.intimacy <
                statusHandler(characterData).intimacyMax / 2 && (
                <BrokenHeartContainer>
                  <BrokenHeart />
                </BrokenHeartContainer>
              )}
            {characterData &&
              spriteLoaded &&
              characterData.status.fullness <
                statusHandler(characterData).fullnessMax / 2 && (
                <HungryEffectContainer>
                  <HungryEffect />
                </HungryEffectContainer>
              )}
            <LevelupText ref={levelupRef}>LEVEL UP</LevelupText>
          </EffectContainer>
        </CharacterCanvasContainer>
        <InteractionContainer>
          <InteractionButton onClick={() => eatMutation.mutate()}>
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
        <ServerMsgBox ref={messageBarRef} onClick={toggleMsgModal}>
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
              <ModalMsgTimestamp>
                {formatTimestamp(msg.timestamp)}
              </ModalMsgTimestamp>
              <ModalMsgText>{msg.text}</ModalMsgText>
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
          {[
            "리듬타기",
            "걸음마",
            "발차기",
            "스트레칭",
            "점프",
            "셔플댄스",
            "댑",
            "댄스",
          ].map((name, i) => (
            <AnimContainer key={name}>
              <AnimButton onClick={playAnimation(i)}>{name}</AnimButton>
              {motionData && i >= motionData.motion.length && (
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

const FaceContainer = tw.div`
w-16
h-16
group-hover:scale-110
transition-all
`;

const FaceImg = tw.img`
w-16
h-16
scale-125
translate-y-1
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
text-slate-100
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
text-slate-100
`;

const ChatIcon = tw(FaRegCommentDots)`
w-5
h-5
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
w-24
lg:w-28
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
group
`;

const PropertyVertical = tw.div`
flex
flex-col
space-y-2
relative
`;

const MealMsg = tw.div`
hidden
group-hover:block
absolute
top-10
right-0
p-2
w-32
text-white
text-center
bg-slate-400
rounded-lg border-2
border-slate-800
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
text-slate-100
`;

const RefreshIcon = tw.img`
w-8
h-6
lg:w-10
lg:h-8
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
overflow-clip
overflow-ellipsis
break-words
line-clamp-1
`;

const PlusIcon = tw(HiPlusCircle)`
w-4
h-4
min-w-4
min-h-4
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
translate-y-24
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

const ModalMsg = tw.div`
flex
p-2
space-x-2
`;

const ModalMsgTimestamp = tw.p`
text-sm
lg:text-base
font-bold
text-slate-500
`;

const ModalMsgText = tw.p`
text-sm
lg:text-base
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

const ImgContainer = tw.div`
relative
w-80
h-80
scale-75
rotate-[60deg]
translate-y-1
translate-x-8
`;

const BabyImg = tw.img`
h-full
absolute
left-1/2
top-1/2
-translate-x-1/2
-translate-y-1/2
`;

const BabyFaceImg = tw.img`
h-[10.2rem]
absolute
left-40
top-9
-translate-x-1/2
scale-[163%]
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
  content: {
    border: "3px solid black",
    overflow: "hidden",
    outline: "none",
  },
};
