import tw from "tailwind-styled-components";
import deathFrameImage from "@/assets/images/deathFrame.png";
import { ICollection } from "@/models";

interface IProps {
  collection: ICollection;
  award: boolean;
}

export default function CollectionItem({ collection, award }: IProps) {
  const formatEnding = (ending: string) => {
    if (ending === "RUNAWAY") {
      return "가출";
    } else if (ending === "SICK") {
      return "병사";
    } else if (ending === "HUNGRY") {
      return "아사";
    }
  };

  return (
    <Wrapper>
      <Container>
        <BackgroundImage
          $grayscale={collection.ending !== "INDEPENDENT"}
          style={{
            backgroundImage: `url(${collection.characterUrl})`,
          }}
        />
        {collection.ending !== "INDEPENDENT" && (
          <img src={deathFrameImage} className="absolute w-full h-full" />
        )}
        <NameContainer>
          <CharacterName>{collection.characterName}</CharacterName>
        </NameContainer>
        {award && <Username>{collection.userId}</Username>}
        {collection.ending !== "INDEPENDENT" && (
          <DeathType>{formatEnding(collection.ending)}</DeathType>
        )}
      </Container>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
justify-center
items-center
`;

const Container = tw.div`
relative
w-full
max-w-60
h-40
lg:h-52
rounded-xl
shadow-lg
overflow-hidden
border-2
border-slate-800
`;

const BackgroundImage = tw.div<{ $grayscale: boolean }>`
absolute
w-full
h-full
${(p) => (p.$grayscale ? "grayscale" : "")}
bg-cover
bg-no-repeat
bg-center
`;

const NameContainer = tw.div`
absolute
left-1/2
-translate-x-1/2
bottom-2
px-2
shadow-lg
bg-slate-50/90
rounded-lg
z-10
border-2
border-slate-800
`;

const CharacterName = tw.h1`
text-sm
lg:text-base
overflow-clip
overflow-ellipsis
break-words
line-clamp-1
font-bold
`;

const Username = tw.h4`
z-10
text-slate-100/90
text-xs
cursor-pointer
absolute
top-2
left-4
underline
font-bold
`;

const DeathType = tw.h1`
absolute
top-1/2
left-1/2
-translate-x-1/2
-translate-y-1/2
text-red-500
font-extrabold
text-2xl
z-10
`;
