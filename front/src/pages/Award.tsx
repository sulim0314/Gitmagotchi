import tw from "tailwind-styled-components";
import LaurelImg from "@/assets/images/collectionLaurel.png";
import { HiChevronDown } from "react-icons/hi";
import CollectionItem from "@/components/common/CollectionItem";
import { useQuery } from "@tanstack/react-query";
import { searchCollection } from "@/api/collection";
import { ICollection } from "@/models";
import { useEffect, useState } from "react";

export default function Award() {
  const [page, setPage] = useState<number>(1);
  const [latest, setLatest] = useState<boolean>(true);
  const [awardList, setAwardList] = useState<ICollection[]>([]);

  const { data } = useQuery({
    queryKey: ["award", latest ? "LATEST" : "OLDEST", page],
    queryFn: () =>
      searchCollection({
        isCollection: false,
        isIndependent: true,
        orderBy: latest ? "LATEST" : "OLDEST",
        page,
        pageSize: 12,
      }),
  });

  useEffect(() => {
    setPage(1);
  }, []);

  useEffect(() => {
    if (!data?.content) return;
    setAwardList(data.content);
  }, [data]);

  return (
    <Wrapper>
      <Container>
        <img src={LaurelImg} className="w-40" />
        <Title>명예의 전당</Title>
        <Description>최고 레벨을 달성한 캐릭터들을 만나보세요.</Description>
        <SortOptionContainer>
          <SortOption>
            <SortOptionText onClick={() => setLatest(!latest)}>
              {latest ? "최신순" : "오래된순"}
            </SortOptionText>
            <DownChevronIcon />
          </SortOption>
        </SortOptionContainer>
        <CharacterGrid>
          {awardList.map((collection: ICollection) => (
            <CollectionItem key={collection.id} collection={collection} award />
          ))}
        </CharacterGrid>
      </Container>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
`;

const Container = tw.div`
w-full
h-20
flex-grow
flex
flex-col
items-center
space-y-4
overflow-y-scroll
lg:px-32
`;

const Title = tw.h1`
font-bold
text-2xl
`;

const Description = tw.h4`
text-sm
`;

const CharacterGrid = tw.div`
w-full
p-4
grid
grid-cols-3
lg:grid-cols-6
gap-2
`;

const SortOptionContainer = tw.div`
w-full
flex
px-4
justify-end
`;

const SortOption = tw.div`
flex
items-center
cursor-pointer
-mb-5
`;

const SortOptionText = tw.h4``;

const DownChevronIcon = tw(HiChevronDown)`
w-4
h-4
`;
