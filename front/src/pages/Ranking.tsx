import tw from "tailwind-styled-components";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import RankingItem from "@/components/ranking/RankingItem";
import { useQuery } from "@tanstack/react-query";
import { getRankingList } from "@/api/ranking";
import { useState } from "react";
import { IRanking } from "@/models";

export default function Ranking() {
  const [menu, setMenu] = useState<"BEST" | "WORST">("BEST");
  const { data } = useQuery({
    queryKey: ["ranking", menu],
    queryFn: () => getRankingList(),
  });

  const changeMenu = () => {
    if (menu === "BEST") {
      setMenu("WORST");
    } else {
      setMenu("BEST");
    }
  };

  return (
    <Wrapper>
      <DesktopMenu>
        <DesktopMenuItem $selected={menu === "BEST"} onClick={() => setMenu("BEST")}>
          <DesktopMenuText>BEST 랭킹</DesktopMenuText>
        </DesktopMenuItem>
        <DesktopMenuItem $selected={menu === "WORST"} onClick={() => setMenu("WORST")}>
          <DesktopMenuText>WORST 랭킹</DesktopMenuText>
        </DesktopMenuItem>
      </DesktopMenu>
      <Container>
        <MobileHeader>
          <MobileRankingMenu>
            <LeftIcon onClick={changeMenu} />
            <RankingMenuText>{`${menu} 랭킹`}</RankingMenuText>
            <RightIcon onClick={changeMenu} />
          </MobileRankingMenu>
        </MobileHeader>
        <MyRank>내 등수: 50등</MyRank>
        <RankListContainer>
          <RankList>
            {data?.map((r: IRanking) => (
              <RankingItem ranking={r} best={menu === "BEST"} />
            ))}
          </RankList>
        </RankListContainer>
      </Container>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
lg:flex-row
lg:space-x-20
bg-[#f2f2f2]
`;

const DesktopMenu = tw.div`
hidden
w-1/4
min-w-60
h-full
lg:flex
flex-col
p-10
space-y-2
`;

const DesktopMenuItem = tw.button<{ $selected: boolean }>`
${(p) => (p.$selected ? "bg-purple-200 border-slate-800" : "border-transparent")}
border-2
h-14
w-full
flex
items-center
hover:bg-purple-200
hover:border-slate-800
rounded-2xl
focus:outline-none
`;

const DesktopMenuText = tw.h1`
px-10
w-full
text-left
text-base
overflow-clip
break-works
flex-grow
font-bold
`;

const Container = tw.div`
w-full
h-full
flex
flex-col
lg:p-10
`;

const MobileHeader = tw.div`
lg:hidden
w-full
h-20
flex
flex-col
justify-between
p-2
`;

const MobileRankingMenu = tw.div`
w-full
flex
justify-center
items-center
space-x-4
`;

const RankingMenuText = tw.h1`
text-xl
`;

const LeftIcon = tw(HiChevronLeft)`
w-6
h-6
text-slate-400
cursor-pointer
`;

const RightIcon = tw(HiChevronRight)`
w-6
h-6
text-slate-400
cursor-pointer
`;

const MyRank = tw.div`
w-full
flex
justify-end
border-b
p-2
border-slate-300
`;

const RankListContainer = tw.div`
w-full
h-20
flex-grow
`;

const RankList = tw.div`
w-full
h-full
overflow-y-scroll
`;
