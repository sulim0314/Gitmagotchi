import tw from "tailwind-styled-components";
import { HiChevronLeft, HiChevronRight, HiChevronDown, HiChevronUp } from "react-icons/hi";
import { HiOutlineSearch } from "react-icons/hi";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSearchList } from "@/api/search";
import CharacterItem from "@/components/search/CharacterItem";
import { ICharacter, IUser } from "@/models";
import UserItem from "@/components/search/UserItem";

export default function Search() {
  const [type, setType] = useState<"CHARACTER" | "USER">("CHARACTER");
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const { data } = useQuery({
    queryKey: ["search", type, keyword],
    queryFn: () => getSearchList({ type, keyword }),
  });

  const changeType = () => {
    if (type === "CHARACTER") {
      setType("USER");
    } else {
      setType("CHARACTER");
    }
  };

  const toggleHistoryOpen = () => {
    setHistoryOpen((prev) => !prev);
  };

  const onChangeKeyword: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setKeyword(e.target.value);
  };

  return (
    <Wrapper>
      <DesktopMenu>
        <DesktopMenuItem $selected={type === "CHARACTER"} onClick={() => setType("CHARACTER")}>
          <DesktopMenuText>캐릭터 검색</DesktopMenuText>
        </DesktopMenuItem>
        <DesktopMenuItem $selected={type === "USER"} onClick={() => setType("USER")}>
          <DesktopMenuText>사용자 검색</DesktopMenuText>
        </DesktopMenuItem>
      </DesktopMenu>
      <Container>
        <MobileHeader>
          <MobileRankingMenu>
            <LeftIcon onClick={changeType} />
            <RankingMenuText>{`${
              type === "CHARACTER" ? "캐릭터" : "사용자"
            } 검색`}</RankingMenuText>
            <RightIcon onClick={changeType} />
          </MobileRankingMenu>
        </MobileHeader>
        <InputContainer>
          <SearchInput
            placeholder={`${type === "CHARACTER" ? "캐릭터" : "사용자"}를 찾아보세요.`}
            onChange={onChangeKeyword}
          />
          <SearchIcon />
        </InputContainer>
        <Content>
          <ScrollContent>
            <RecentKeywordContainer>
              <TitleContainer>
                <Title>최근검색어</Title>
                {historyOpen ? (
                  <UpIcon onClick={toggleHistoryOpen} />
                ) : (
                  <DownIcon onClick={toggleHistoryOpen} />
                )}
              </TitleContainer>
              {historyOpen && <ResultKeywordList>최근 검색내역이 없습니다.</ResultKeywordList>}
            </RecentKeywordContainer>
            {historyOpen && <Divider />}
            <ResultContainer>
              <TitleContainer>
                <Title>검색 결과</Title>
              </TitleContainer>
              {data && type === "CHARACTER" ? (
                <CharacterResultList>
                  {data?.map((c: ICharacter) => (
                    <CharacterItem key={c.id} character={c} />
                  ))}
                </CharacterResultList>
              ) : (
                <UserResultList>
                  {data?.map((u: IUser) => (
                    <UserItem key={u.id} user={u} />
                  ))}
                </UserResultList>
              )}
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

const UpIcon = tw(HiChevronUp)`
w-6
h-6
text-slate-400
cursor-pointer
`;

const DownIcon = tw(HiChevronDown)`
w-6
h-6
text-slate-400
cursor-pointer
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

const UserResultList = tw.div`
w-full
h-full
`;

const CharacterResultList = tw.div`
w-full
h-full
p-4
grid
grid-cols-3
gap-2
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
font-bold
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
