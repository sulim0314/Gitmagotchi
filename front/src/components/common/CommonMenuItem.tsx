import { HiOutlineChevronRight } from "react-icons/hi";
import tw from "tailwind-styled-components";

interface IProps {
  text: string;
  onClick?: () => void;
}

export default function CommonMenuItem({ text, onClick }: IProps) {
  return (
    <MenuItem onClick={onClick}>
      {text}
      <LinkIcon />
    </MenuItem>
  );
}

const MenuItem = tw.li`
w-full
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

const LinkIcon = tw(HiOutlineChevronRight)`
w-4
h-4
text-slate-500
`;
