import tw from "tailwind-styled-components";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import RankingItem from "@/components/Ranking/RankingItem";
import { HiOutlineSearch } from "react-icons/hi";

export default function Search() {
  return (
    <Wrapper>
      <DesktopMenu>
        <DesktopMenuItem $selected={true}>캐릭터 검색</DesktopMenuItem>
        <DesktopMenuItem $selected={false}>사용자 검색</DesktopMenuItem>
      </DesktopMenu>
      <Container>
        <MobileHeader>
          <MobileRankingMenu>
            <LeftIcon />
            <RankingMenuText>캐릭터 검색</RankingMenuText>
            <RightIcon />
          </MobileRankingMenu>
        </MobileHeader>
        <InputContainer>
          <SearchInput placeholder="캐릭터를 찾아보세요." />
          <SearchIcon />
        </InputContainer>
        <Content>
          <ScrollContent>
            <RecentKeywordContainer>
              <TitleContainer>
                <Title>최근검색어</Title>
              </TitleContainer>
              <ResultKeywordList>최근 검색내역이 없습니다.</ResultKeywordList>
            </RecentKeywordContainer>
            <Divider />
            <ResultContainer>
              <TitleContainer>
                <Title>검색 결과</Title>
              </TitleContainer>
              <SearchResultList>
                <RankingItem rank={1} best={true} />
                <RankingItem rank={2} best={true} />
                <RankingItem rank={3} best={true} />
                <RankingItem rank={4} best={true} />
                <RankingItem rank={5} best={true} />
                <RankingItem rank={6} best={true} />
                <RankingItem rank={7} best={true} />
                <RankingItem rank={8} best={true} />
              </SearchResultList>
            </ResultContainer>
          </ScrollContent>
        </Content>
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

const InputContainer = tw.div`
w-full
flex
px-8
justify-center
relative
`;

const SearchInput = tw.input`
w-full
h-10
border-b-2
bg-transparent
border-slate-300
pl-2
pr-10
focus:outline-none
`;

const SearchIcon = tw(HiOutlineSearch)`
absolute
w-6
h-6
right-10
top-1/2
-translate-y-1/2
`;

const Content = tw.div`
w-full
h-20
flex-grow
py-10
`;

const ScrollContent = tw.div`
w-full
h-full
overflow-y-scroll
`;

const SearchResultList = tw.div`
w-full
h-full
`;

const RecentKeywordContainer = tw.div`
w-full
`;

const ResultContainer = tw.div`
w-full
h-20
flex-grow
`;

const TitleContainer = tw.div`
flex
justify-between
px-8
py-4
`;

const Divider = tw.div`
bg-slate-300/50
lg:bg-transparent
w-full
h-4
`;

const Title = tw.h1`
font-medium
text-xl
`;

const ResultKeywordList = tw.div`
w-full
min-h-40
flex
flex-col
justify-center
items-center
lg:bg-slate-200
lg:rounded-lg
`;
