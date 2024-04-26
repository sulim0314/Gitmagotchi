import CommonButton from "@/components/common/CommonButton";
import tw from "tailwind-styled-components";
import sampleBgImage from "@/assets/images/sampleBg.jpg";
import sampleCharacter2Image from "@/assets/images/sampleCharacter2.png";
import { HiCheckCircle, HiOutlineTrash } from "react-icons/hi";

export default function ChangeBg() {
  return (
    <Wrapper>
      <Header>
        <Title>현재 배경화면</Title>
        <NewBgLink>+ 새 배경화면</NewBgLink>
      </Header>
      <Content>
        <CurrentBgContainer>
          <CurrentBg
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <img src={sampleCharacter2Image} className="w-1/2" />
          </CurrentBg>
        </CurrentBgContainer>
        <BgList>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <TrashIcon />
          </BgItem>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <SelectedContainer>
              <CheckIcon />
              <CheckText>선택됨</CheckText>
            </SelectedContainer>
            <TrashIcon />
          </BgItem>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <TrashIcon />
          </BgItem>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <TrashIcon />
          </BgItem>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <TrashIcon />
          </BgItem>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <TrashIcon />
          </BgItem>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <TrashIcon />
          </BgItem>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <TrashIcon />
          </BgItem>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <TrashIcon />
          </BgItem>
          <BgItem
            style={{
              backgroundImage: `url(${sampleBgImage})`,
            }}
          >
            <TrashIcon />
          </BgItem>
        </BgList>
      </Content>
      <CommonButton title="변경" />
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
space-y-6
items-center
bg-[#e4eded]
pb-6
lg:p-14
`;

const Header = tw.div`
w-full
flex
justify-between
items-end
p-8
lg:px-40
`;

const Title = tw.h1`
text-xl
`;

const NewBgLink = tw.h4`
text-sm
text-slate-400
`;

const Content = tw.div`
w-full
h-20
flex-grow
flex
flex-col
lg:flex-row
space-y-4
lg:space-y-0
lg:justify-center
`;

const CurrentBgContainer = tw.div`
px-8
lg:w-[30rem]
`;

const CurrentBg = tw.div`
w-full
aspect-square
flex
justify-center
items-center
rounded-xl
bg-cover
bg-no-repeat
bg-center
shadow-lg
`;

const BgList = tw.div`
h-40
px-4
lg:py-4
lg:w-[40rem]
flex
lg:grid
lg:grid-cols-4
lg:overflow-y-scroll
lg:gap-2
lg:h-[26rem]
lg:items-start
items-center
space-x-2
lg:space-x-0
bg-slate-300
overflow-x-scroll
scrollbar-hide
lg:scrollbar-default
lg:overflow-x-auto
lg:rounded-lg
`;

const BgItem = tw.div`
h-36
aspect-square
rounded-xl
shadow-lg
bg-cover
bg-no-repeat
bg-center
cursor-pointer
hover:scale-105
group
relative
`;

const SelectedContainer = tw.div`
w-full
h-full
rounded-xl
bg-slate-900/50
flex
flex-col
justify-center
items-center
`;

const CheckIcon = tw(HiCheckCircle)`
w-10
h-10
text-slate-100/70
`;

const CheckText = tw.h2`
text-lg
font-bold
text-slate-100/70
`;

const TrashIcon = tw(HiOutlineTrash)`
hidden
group-hover:block
w-6
h-6
absolute
top-2
right-2
text-slate-400
hover:text-red-400
`;
