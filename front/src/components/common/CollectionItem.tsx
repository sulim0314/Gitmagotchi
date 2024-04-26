import tw from "tailwind-styled-components";
import sampleBgImage from "@/assets/images/sampleBg.jpg";
import sampleCharacter2Image from "@/assets/images/sampleCharacter2.png";
import deathFrameImage from "@/assets/images/deathFrame.png";

interface IProps {
  award: boolean;
  deathType?: string;
  collection?: boolean;
}

export default function CollectionItem({ award, deathType, collection }: IProps) {
  return (
    <Wrapper>
      <BackgroundImage
        $grayscale={!award}
        style={{
          backgroundImage: `url(${sampleBgImage})`,
        }}
      />
      <img src={sampleCharacter2Image} className={`w-2/3 z-10 ${!award && "grayscale"}`} />
      {!award && <img src={deathFrameImage} className="absolute w-full h-full" />}
      <NameContainer>도날드덕</NameContainer>
      {!collection && <Username>Tama1001</Username>}
      <DeathType>{deathType}</DeathType>
    </Wrapper>
  );
}

const Wrapper = tw.div`
relative
w-full
h-40
lg:h-52
rounded-xl
shadow-lg
flex
flex-col
items-center
justify-center
overflow-hidden
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
bg-slate-100/70
py-1
px-2
rounded-lg
text-base
z-10
`;

const Username = tw.h4`
z-10
text-slate-100/90
text-xs
cursor-pointer
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
