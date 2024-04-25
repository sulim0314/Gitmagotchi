import tw from "tailwind-styled-components";
import { useState } from "react";
import { HiOutlineMenu, HiOutlineChevronRight, HiOutlineChevronLeft, HiX } from "react-icons/hi";
import SampleProfileImage from "@/assets/images/sampleProfile.png";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  pageTitle?: string;
  canGoBack?: boolean;
}

export default function Navbar({ pageTitle, canGoBack }: IProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = () => setOpen(!open);

  const onClickLink = (url: string) => {
    return () => {
      setOpen(false);
      navigate(url);
    };
  };

  const navItems = [
    { id: 1, text: "캐릭터 도감", url: "/collection" },
    { id: 2, text: "명예의 전당", url: "/award" },
    { id: 3, text: "사용자 랭킹", url: "/ranking" },
    { id: 4, text: "배경화면", url: "/changebg" },
    { id: 5, text: "통합검색", url: "/search" },
  ];

  return (
    <Wrapper>
      <TitleContainer>
        {canGoBack && <BackIcon />}
        <Title $main={location.pathname === "/"} onClick={onClickLink("/")}>
          GITMAGOTCHI
        </Title>
      </TitleContainer>
      <DesktopMenu>
        {navItems.map((item) => (
          <DesktopMenuItem key={item.id} onClick={onClickLink(item.url)}>
            {item.text}
          </DesktopMenuItem>
        ))}
        <DesktopUserContainer onClick={onClickLink("/mypage")}>
          <UserImg src={SampleProfileImage} />
          <UserNickname>코드몽키</UserNickname>
        </DesktopUserContainer>
      </DesktopMenu>
      <MobileMenuButton onClick={toggleOpen}>
        {open ? <CloseIcon /> : <MenuIcon />}
      </MobileMenuButton>
      <MobileMenu $open={open}>
        <MobileMenuTitle onClick={onClickLink("/")}>{pageTitle || "GITMAGOTCHI"}</MobileMenuTitle>
        <MobileUserContainer onClick={onClickLink("/mypage")}>
          <UserImg src={SampleProfileImage} />
          <UserInfo>
            <GithubUsername>Tamma1001</GithubUsername>
            <UserNickname>코드몽키</UserNickname>
          </UserInfo>
        </MobileUserContainer>
        <MobileMenuList>
          {navItems.map((item) => (
            <MobileMenuItem key={item.id} onClick={onClickLink(item.url)}>
              {item.text}
              <LinkIcon />
            </MobileMenuItem>
          ))}
        </MobileMenuList>
      </MobileMenu>
    </Wrapper>
  );
}

const Wrapper = tw.div`
flex
justify-between
items-center
h-24
w-full
mx-auto
px-4
`;

const TitleContainer = tw.div`
flex-grow
flex
space-x-2
`;

const Title = tw.h1<{ $main: boolean }>`
${(p) => (p.$main ? "hidden lg:block" : "block")}
text-2xl
font-medium
text-slate-800
cursor-pointer
`;

const DesktopMenu = tw.ul`
hidden
lg:flex
lg:space-x-2
`;

const DesktopMenuItem = tw.li`
p-4
m-2
cursor-pointer
hover:font-semibold
`;

const DesktopUserContainer = tw.div`
flex
space-x-4
items-center
px-10
`;

const MobileMenuButton = tw.div`
block
lg:hidden
cursor-pointer
`;

const MobileMenu = tw.ul<{ $open: boolean }>`
${(p) => (p.$open ? "left-0" : "-left-full")}
w-3/5
lg:hidden
h-full
bg-blue-50
top-0
fixed
ease-in-out
duration-500
shadow-xl
z-50
`;

const MobileMenuList = tw.div`
p-4
`;

const MobileMenuItem = tw.li`
p-6
flex
justify-between
border-b
border-slate-300
hover:bg-purple-200
duration-300
cursor-pointer
font-semibold
`;

const MobileMenuTitle = tw.h1`
text-2xl
font-medium
text-slate-800
p-6
cursor-pointer
`;

const MobileUserContainer = tw.div`
w-auto
h-24
border-y
m-2
flex
items-center
p-4
border-slate-300
space-x-4
`;

const MenuIcon = tw(HiOutlineMenu)`
w-8
h-8
text-slate-700
`;

const CloseIcon = tw(HiX)`
w-8
h-8
text-slate-700
`;

const BackIcon = tw(HiOutlineChevronLeft)`
w-8
h-8
text-slate-700
`;

const LinkIcon = tw(HiOutlineChevronRight)`
w-4
h-4
text-slate-500
`;

const UserImg = tw.img`
w-10
h-10
rounded-lg
shadow-lg
`;

const UserInfo = tw.div`
flex
flex-col
`;

const GithubUsername = tw.p`
text-xs
font-light
text-slate-600
`;

const UserNickname = tw.p`
text-lg
font-semibold
`;
