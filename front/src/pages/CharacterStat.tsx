import tw from "tailwind-styled-components";
import CommonButton from "@/components/common/CommonButton";
import { BsStars } from "react-icons/bs";
import { HiHeart } from "react-icons/hi";
import { LuBatteryFull } from "react-icons/lu";
import { FaArrowUp } from "react-icons/fa";
import { useRecoilState, useSetRecoilState } from "recoil";
import { characterDataAtom } from "@/store/character";
import { expHandler } from "@/util/value";
import { useMutation } from "@tanstack/react-query";
import { resetStatPoint } from "@/api/character";
import { userDataAtom } from "@/store/user";

export default function CharacterStat() {
  const [characterData, setCharacterData] = useRecoilState(characterDataAtom);
  const setUserData = useSetRecoilState(userDataAtom);

  const mutation = useMutation({
    mutationFn: resetStatPoint,
    onSuccess: (data) => {
      console.log(data.message);
      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          gold: data.gold,
        };
      });
      setCharacterData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          stat: {
            fullnessStat: 1,
            intimacyStat: 1,
            cleannessStat: 1,
            unusedStat: data.unusedStat,
          },
        };
      });
    },
    onError: (err) => console.log(err),
  });

  const upFullness = () => {
    setCharacterData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stat: {
          ...prev.stat,
          unusedStat: prev.stat.unusedStat - 1,
          fullnessStat: prev.stat.fullnessStat + 1,
        },
      };
    });
  };

  const upIntimacy = () => {
    setCharacterData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stat: {
          ...prev.stat,
          unusedStat: prev.stat.unusedStat - 1,
          intimacyStat: prev.stat.intimacyStat + 1,
        },
      };
    });
  };

  const upCleanness = () => {
    setCharacterData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stat: {
          ...prev.stat,
          unusedStat: prev.stat.unusedStat - 1,
          cleannessStat: prev.stat.cleannessStat + 1,
        },
      };
    });
  };

  const resetPoint = () => {
    if (!characterData) return;
    if (characterData.stat.unusedStat > 0) {
      mutation.mutate();
    }
  };

  if (!characterData) return null;

  return (
    <Wrapper>
      <CharacterContainer>
        <ExpContainer>
          <LevelText>{`LV.${expHandler(characterData.exp).level}`}</LevelText>
          <ExpBarContainer className="text-border">
            <ExpBar style={{ width: `${expHandler(characterData.exp).percentage}%` }} />
            <DataText>{`${expHandler(characterData.exp).curExp} / ${
              expHandler(characterData.exp).maxExp
            }`}</DataText>
          </ExpBarContainer>
        </ExpContainer>
        <NameContainer>
          <img src={characterData.faceUrl} className="w-36 lg:w-72" />
          <Name>{characterData.name}</Name>
          <BirthDate>{characterData.createdAt} 출생</BirthDate>
        </NameContainer>
      </CharacterContainer>
      <OtherContainer>
        <StatPointContainer>
          <StatPointText>스탯 포인트</StatPointText>
          <StatPointBox>
            <StatPointNumber>{characterData.stat.unusedStat}</StatPointNumber>
          </StatPointBox>
        </StatPointContainer>
        <StatList>
          <StatRowContainer>
            <StatRow>
              <StatTitle>
                <BatteryIcon />
                <StatText>포만감</StatText>
              </StatTitle>
              <StatText>{`LV.${characterData.stat.fullnessStat}`}</StatText>
              <LevelupButton disabled={characterData.stat.unusedStat === 0} onClick={upFullness}>
                <UpIcon />
              </LevelupButton>
            </StatRow>
            <StatDescription>
              포만감 스텟을 올릴 시 상승하는 포만감 양이 상승합니다.
            </StatDescription>
          </StatRowContainer>
          <StatRowContainer>
            <StatRow>
              <StatTitle>
                <HeartIcon />
                <StatText>친밀도</StatText>
              </StatTitle>
              <StatText>{`LV.${characterData.stat.intimacyStat}`}</StatText>
              <LevelupButton disabled={characterData.stat.unusedStat === 0} onClick={upIntimacy}>
                <UpIcon />
              </LevelupButton>
            </StatRow>
            <StatDescription>친밀도 스텟을 올릴 시 친밀도 최대치가 상승합니다.</StatDescription>
          </StatRowContainer>
          <StatRowContainer>
            <StatRow>
              <StatTitle>
                <ShineIcon />
                <StatText>청결도</StatText>
              </StatTitle>
              <StatText>{`LV.${characterData.stat.cleannessStat}`}</StatText>
              <LevelupButton disabled={characterData.stat.unusedStat === 0} onClick={upCleanness}>
                <UpIcon />
              </LevelupButton>
            </StatRow>
            <StatDescription>청결도 스텟을 하락하는 청결도 양이 줄어듭니다.</StatDescription>
          </StatRowContainer>
          <CommonButton title="스탯 초기화 (💰100)" onClick={resetPoint} />
        </StatList>
      </OtherContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-20
flex-grow
flex
flex-col
lg:flex-row
items-center
overflow-y-scroll
`;

const CharacterContainer = tw.div`
w-full
flex
flex-col
items-center
lg:flex-col-reverse
`;

const LevelText = tw.h1`
p-2
w-full
`;

const ExpContainer = tw.div`
w-full
max-w-[30rem]
lg:max-w-[35rem]
py-4
px-16
flex
flex-col
`;

const ExpBarContainer = tw.div`
w-full
h-4
lg:h-6
bg-green-400/50
rounded-lg
shadow-md
flex
justify-center
items-center
relative
border-2
border-slate-500
`;

const ExpBar = tw.div`
absolute
top-0
left-0
bg-green-500
h-full
rounded-lg
`;

const DataText = tw.p`
text-sm
lg:text-base
z-10
text-slate-100
`;

const NameContainer = tw.div`
w-full
flex
flex-col
items-center
space-y-2
py-4
`;

const Name = tw.h1`
text-2xl
`;

const BirthDate = tw.p`
text-sm
text-slate-500
`;

const OtherContainer = tw.div`
w-full
h-full
flex
flex-col
justify-center
items-center
lg:space-y-10
`;

const StatPointContainer = tw.div`
flex
w-full
h-20
lg:h-40
justify-center
items-center
space-x-6
`;

const StatPointBox = tw.div`
w-10
h-10
bg-slate-700
rounded-xl
flex
justify-center
items-center
shadow-lg
`;

const StatPointText = tw.h1`
font-medium
text-2xl
`;

const StatPointNumber = tw.h2`
text-slate-100
font-bold
`;

const StatList = tw.div`
w-full
max-w-[30rem]
lg:max-w-[35rem]
p-8
flex
flex-col
items-center
space-y-6
lg:space-y-12
`;

const BatteryIcon = tw(LuBatteryFull)`
w-8
h-8
lg:w-8
lg:h-8
`;

const HeartIcon = tw(HiHeart)`
w-8
h-8
lg:w-8
lg:h-8
`;

const ShineIcon = tw(BsStars)`
w-8
h-8
lg:w-8
lg:h-8
`;

const StatRowContainer = tw.div`
w-full
px-10
flex
flex-col
space-y-1
lg:space-y-2
`;

const StatRow = tw.div`
w-full
flex
space-x-2
items-center
justify-between
`;

const StatTitle = tw.div`
flex
space-x-4
`;

const StatDescription = tw.p`
text-xs
text-slate-500
`;

const StatText = tw.h2`
text-xl
`;

const LevelupButton = tw.button`
w-8
h-8
bg-purple-800
flex
justify-center
items-center
rounded-lg
cursor-pointer
disabled:cursor-default
disabled:bg-purple-200
`;

const UpIcon = tw(FaArrowUp)`
w-6
h-6
text-slate-100
`;
