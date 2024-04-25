import tw from "tailwind-styled-components";
import { IoSend } from "react-icons/io5";

export default function Chat() {
  return (
    <Wrapper>
      <ChatContainer>
        <ChatList>
          <ChatRow></ChatRow>
          <ChatRow></ChatRow>
          <ChatRow></ChatRow>
          <ChatRow></ChatRow>
        </ChatList>
      </ChatContainer>
      <ChatInputContainer>
        <ChatInput />
        <SendIcon />
      </ChatInputContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
bg-[#e4eded]
`;

const ChatContainer = tw.div`
w-full
h-20
flex-grow
bg-blue-200
`;

const ChatList = tw.div`
w-full
h-full
grow-0
overflow-y-scroll
`;

const ChatRow = tw.div`
w-full
h-80
`;

const ChatInputContainer = tw.div`
w-full
p-4
relative
`;

const ChatInput = tw.input`
h-12
w-full
rounded-3xl
border
border-slate-400
bg-slate-300/30
text-slate-500
placeholder:text-slate-400
shadow-lg
pl-6
pr-10
text-xl
focus:outline-none
`;

const SendIcon = tw(IoSend)`
w-6
h-6
absolute
right-7
bottom-7
text-slate-600
cursor-pointer
`;
