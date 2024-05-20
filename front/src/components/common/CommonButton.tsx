import tw from "tailwind-styled-components";

interface IProps {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function CommonButton({ title, onClick, disabled }: IProps) {
  return (
    <Container onClick={onClick} disabled={disabled}>
      {title}
    </Container>
  );
}

const Container = tw.button`
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
disabled:cursor-default
disabled:bg-purple-100
border-2
border-slate-800
font-bold
`;
