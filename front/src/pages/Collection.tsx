import tw from "tailwind-styled-components";
import TotalImg from "@/assets/images/user.svg";
import LaurelImg from "@/assets/images/laurel.svg";
import DeathImg from "@/assets/images/skull.svg";
import { useEffect, useRef, useState } from "react";
import CollectionItem from "@/components/common/CollectionItem";
import { searchCollection } from "@/api/collection";
import { useQuery } from "@tanstack/react-query";
import { ICollection } from "@/models";

type CollectionMenu = "TOTAL" | "AWARD" | "DEATH";

export default function Collection() {
  const [menu, setMenu] = useState<CollectionMenu>("TOTAL");
  const [page, setPage] = useState<number>(1);
  const [collectionList, setCollectionList] = useState<ICollection[]>([]);
  const [countTotal, setCountTotal] = useState<number[]>([0, 0, 0]);
  const listRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["collection", menu, page],
    queryFn: () =>
      searchCollection({
        isCollection: true,
        isIndependent: menuProp(menu),
        orderBy: "LATEST",
        page,
        pageSize: 12,
      }),
  });

  useEffect(() => {
    const fetchCountTotal = async () => {
      const countTotalPromise = await Promise.all([
        searchCollection({
          isCollection: true,
          isIndependent: null,
        }),
        searchCollection({
          isCollection: true,
          isIndependent: true,
        }),
        searchCollection({
          isCollection: true,
          isIndependent: false,
        }),
      ]);
      setCountTotal([
        countTotalPromise[0].pageable.totalElements,
        countTotalPromise[1].pageable.totalElements,
        countTotalPromise[2].pageable.totalElements,
      ]);
    };
    fetchCountTotal();
  }, []);

  const onScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight;

      if (isNearBottom) {
        console.log("Reached bottom");
        // DO SOMETHING HERE
      }
    }
  };

  useEffect(() => {
    const listElement = listRef.current;

    if (listElement) {
      listElement.addEventListener("scroll", onScroll);

      // Clean-up
      return () => {
        listElement.removeEventListener("scroll", onScroll);
      };
    }
  }, [listRef]);

  useEffect(() => {
    if (!data?.content) return;

    if (page === 1) {
      setCollectionList(data.content);
    } else {
      setCollectionList((prev) => [...prev, ...data.content]);
    }
  }, [data, page]);

  useEffect(() => {
    setPage(1);
  }, [menu]);

  const menuProp = (type: CollectionMenu) => {
    if (type === "AWARD") {
      return true;
    } else if (type === "DEATH") {
      return false;
    }
    return null;
  };

  const changeMenu = (type: CollectionMenu) => {
    return () => {
      setMenu(type);
    };
  };

  return (
    <Wrapper>
      <MenuContainer>
        <MenuItem $selected={menu === "TOTAL"} onClick={changeMenu("TOTAL")}>
          <MenuImg src={TotalImg} />
          <MenuCount>{countTotal[0]}</MenuCount>
          <MenuDescription>키운 캐릭터</MenuDescription>
        </MenuItem>
        <MenuItem $selected={menu === "AWARD"} onClick={changeMenu("AWARD")}>
          <MenuImg src={LaurelImg} />
          <MenuCount>{countTotal[1]}</MenuCount>
          <MenuDescription>독립</MenuDescription>
        </MenuItem>
        <MenuItem $selected={menu === "DEATH"} onClick={changeMenu("DEATH")}>
          <MenuImg src={DeathImg} />
          <MenuCount>{countTotal[2]}</MenuCount>
          <MenuDescription>사망</MenuDescription>
        </MenuItem>
      </MenuContainer>
      <CollectionContainer>
        <CharacterGrid ref={listRef}>
          {collectionList.map((collection: ICollection) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              award={false}
            />
          ))}
        </CharacterGrid>
      </CollectionContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
`;

const MenuContainer = tw.div`
w-full
py-6
px-4
flex
space-x-2
justify-center
`;

const MenuItem = tw.div<{ $selected: boolean }>`
w-28
h-36
rounded-3xl
shadow-xl
flex
flex-col
items-center
justify-center
space-y-2
cursor-pointer
${(p) => (p.$selected ? "bg-[#D1C6D7]" : "bg-[#EDE3F4]")}
border-2
border-slate-800
`;

const MenuImg = tw.img`
w-1/2
`;

const MenuCount = tw.h1`
text-2xl
font-bold
`;

const MenuDescription = tw.h4`
text-sm
font-semibold
`;

const CollectionContainer = tw.div`
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

const CharacterGrid = tw.div`
w-full
p-4
grid
grid-cols-3
lg:grid-cols-6
gap-2
`;
