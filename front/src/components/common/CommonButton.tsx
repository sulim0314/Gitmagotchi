import tw from "tailwind-styled-components";

interface IProps {
  title: string;
  onClick?: () => void;
}

export default function CommonButton({ title, onClick }: IProps) {
  return <Container onClick={onClick}>{title}</Container>;
}

const Container = tw.div`
w-72
lg:w-52
h-10
rounded-lg
flex
items-center
justify-center
bg-purple-300
hover:bg-purple-200
cursor-pointer
`;
