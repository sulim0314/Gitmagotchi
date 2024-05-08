import tw from "tailwind-styled-components";

interface IProps {
  props: object;
}

export default function CommonInput({ props }: IProps) {
  return <Input {...props} autoComplete="off" />;
}

const Input = tw.input`
w-full
h-10
rounded-lg
shadow-lg
px-6
border
text-xl
border-slate-400
bg-slate-300/30
text-slate-500
placeholder:text-slate-400
`;
