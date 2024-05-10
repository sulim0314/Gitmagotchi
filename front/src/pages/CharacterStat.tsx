import tw from "tailwind-styled-components";
import sampleCharacter2Image from "@/assets/images/sampleCharacter2.png";
import CommonButton from "@/components/common/CommonButton";
import { BsStars } from "react-icons/bs";
import { HiHeart } from "react-icons/hi";
import { LuBatteryFull } from "react-icons/lu";
import { FaArrowUp } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { statDataAtom } from "@/store/stat";
import { characterDataAtom } from "@/store/character";
import { expHandler } from "@/util/value";

export default function CharacterStat() {
  const characterData = useRecoilValue(characterDataAtom);
  const statData = useRecoilValue(statDataAtom);
  return (
    <Wrapper>
      <CharacterContainer>
        <ExpContainer>
          <LevelText>LV.9</LevelText>
          <ExpBarContainer>
            <ExpBar style={{ width: `${expHandler(characterData?.exp || 0).percentage}%` }} />
            <DataText>{`${expHandler(characterData?.exp || 0).curExp} / ${
              expHandler(characterData?.exp || 0).maxExp
            }`}</DataText>
          </ExpBarContainer>
        </ExpContainer>
        <NameContainer>
          <img src={sampleCharacter2Image} className="w-36 lg:w-72" />
          <Name>{characterData?.name}</Name>
          <BirthDate>2024.04.15. 출생</BirthDate>
        </NameContainer>
      </CharacterContainer>
      <OtherContainer>
        <StatPointContainer>
          <StatPointText>스탯 포인트</StatPointText>
          <StatPointBox>
            <StatPointNumber>{statData?.unusedStat}</StatPointNumber>
          </StatPointBox>
        </StatPointContainer>
        <StatList>
          <StatRowContainer>
            <StatRow>
              <StatTitle>
                <BatteryIcon />
                <StatText>포만감</StatText>
              </StatTitle>
              <StatText>{`LV.${statData?.fullnessStat}`}</StatText>
              <LevelupButton>
                <UpIcon />
              </LevelupButton>
            </StatRow>
            <StatDescription>
              포만감 스텟을 올릴 시 하락하는 포만감 양이 줄어듭니다.
            </StatDescription>
          </StatRowContainer>
          <StatRowContainer>
            <StatRow>
              <StatTitle>
                <HeartIcon />
                <StatText>친밀도</StatText>
              </StatTitle>
              <StatText>{`LV.${statData?.intimacyStat}`}</StatText>
              <LevelupButton>
                <UpIcon />
              </LevelupButton>
            </StatRow>
            <StatDescription>
              친밀도 스텟을 올릴 시 상승하는 친밀도 양이 상승합니다.
            </StatDescription>
          </StatRowContainer>
          <StatRowContainer>
            <StatRow>
              <StatTitle>
                <ShineIcon />
                <StatText>청결도</StatText>
              </StatTitle>
              <StatText>{`LV.${statData?.cleannessStat}`}</StatText>
              <LevelupButton>
                <UpIcon />
              </LevelupButton>
            </StatRow>
            <StatDescription>청결도 스텟을 올릴 시 청결도 최대치가 상승합니다.</StatDescription>
          </StatRowContainer>
          <CommonButton title="스탯 초기화 (💰100)" />
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
`;

const UpIcon = tw(FaArrowUp)`
w-6
h-6
text-slate-100
`;
