import tw from "tailwind-styled-components";
import { ICharacter } from "@/models";

interface IProps {
  character: ICharacter;
}

export default function CharacterItem({ character }: IProps) {
  return (
    <Wrapper>
      <Container>
        <BackgroundImage
          style={{
            backgroundImage: `url(${character.characterUrl})`,
          }}
        />
        <NameContainer>
          <CharacterName>{character.name}</CharacterName>
        </NameContainer>
        <Username>{character.userId}</Username>
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
`;

const BackgroundImage = tw.div`
absolute
w-full
h-full
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
`;

const CharacterName = tw.h1`
text-sm
lg:text-base
overflow-clip
overflow-ellipsis
break-words
line-clamp-1
`;

const Username = tw.h4`
z-10
text-slate-100/90
text-xs
cursor-pointer
`;
