import tw from "tailwind-styled-components";
import TotalImg from "@/assets/images/collectionTotal.png";
import LaurelImg from "@/assets/images/collectionLaurel.png";
import DeathImg from "@/assets/images/collectionDeath.png";
import { useState } from "react";
import CollectionItem from "@/components/common/CollectionItem";

type CollectionMenu = "TOTAL" | "AWARD" | "DEATH";

export default function Collection() {
  const [menu, setMenu] = useState<CollectionMenu>("TOTAL");

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
          <MenuCount>15</MenuCount>
          <MenuDescription>키운 캐릭터</MenuDescription>
        </MenuItem>
        <MenuItem $selected={menu === "AWARD"} onClick={changeMenu("AWARD")}>
          <MenuImg src={LaurelImg} />
          <MenuCount>12</MenuCount>
          <MenuDescription>명예의 전당</MenuDescription>
        </MenuItem>
        <MenuItem $selected={menu === "DEATH"} onClick={changeMenu("DEATH")}>
          <MenuImg src={DeathImg} />
          <MenuCount>3</MenuCount>
          <MenuDescription>사망</MenuDescription>
        </MenuItem>
      </MenuContainer>
      <CollectionContainer>
        <CharacterGrid>
          <CollectionItem collection award={true} />
          <CollectionItem collection award={false} deathType="아사" />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={false} deathType="병사" />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={false} deathType="가출" />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
          <CollectionItem collection award={true} />
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
