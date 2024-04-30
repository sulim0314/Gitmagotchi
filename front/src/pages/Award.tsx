import tw from "tailwind-styled-components";
import LaurelImg from "@/assets/images/collectionLaurel.png";
import { HiChevronDown } from "react-icons/hi";
import CollectionItem from "@/components/common/CollectionItem";
import { useQuery } from "@tanstack/react-query";
import { getAwardList } from "@/api/collection";
import { ICollection } from "@/models";

export default function Award() {
  const { data } = useQuery({
    queryKey: ["award"],
    queryFn: getAwardList,
  });

  return (
    <Wrapper>
      <Container>
        <img src={LaurelImg} className="w-40" />
        <Title>명예의 전당</Title>
        <Description>최고 레벨을 달성한 캐릭터들을 만나보세요.</Description>
        <SortOptionContainer>
          <SortOption>
            <SortOptionText>최신순</SortOptionText>
            <DownChevronIcon />
          </SortOption>
        </SortOptionContainer>
        <CharacterGrid>
          {data?.map((collection: ICollection) => (
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
bg-[#e4eded]
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
