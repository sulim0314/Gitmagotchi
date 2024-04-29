import tw from "tailwind-styled-components";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import RankingItem from "@/components/Ranking/RankingItem";

export default function Ranking() {
  return (
    <Wrapper>
      <DesktopMenu>
        <DesktopMenuItem $selected={true}>BEST 랭킹</DesktopMenuItem>
        <DesktopMenuItem $selected={false}>WORST 랭킹</DesktopMenuItem>
      </DesktopMenu>
      <Container>
        <MobileHeader>
          <MobileRankingMenu>
            <LeftIcon />
            <RankingMenuText>BEST 랭킹</RankingMenuText>
            <RightIcon />
          </MobileRankingMenu>
        </MobileHeader>
        <MyRank>내 등수: 50등</MyRank>
        <RankListContainer>
          <RankList>
            <RankingItem rank={1} best={true} />
            <RankingItem rank={2} best={true} />
            <RankingItem rank={3} best={true} />
            <RankingItem rank={4} best={true} />
            <RankingItem rank={5} best={true} />
            <RankingItem rank={6} best={true} />
            <RankingItem rank={7} best={true} />
            <RankingItem rank={8} best={true} />
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
bg-[#e4eded]
`;

const DesktopMenu = tw.div`
hidden
w-1/4
h-full
lg:flex
flex-col
p-10
space-y-2
`;

const DesktopMenuItem = tw.button<{ $selected: boolean }>`
${(p) => (p.$selected ? "bg-purple-200" : "")}
h-14
w-full
flex
items-center
px-14
hover:bg-purple-200
rounded-2xl
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
`;

const RightIcon = tw(HiChevronRight)`
w-6
h-6
text-slate-400
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
