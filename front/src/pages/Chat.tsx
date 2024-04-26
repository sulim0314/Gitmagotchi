import tw from "tailwind-styled-components";
import { IoSend } from "react-icons/io5";
import CharacterChat from "@/components/Chat/CharacterChat";
import UserChat from "@/components/Chat/UserChat";
import SampleFaceImage from "@/assets/images/sampleFace.png";
import SampleProfileImage from "@/assets/images/sampleProfile.png";

export default function Chat() {
  return (
    <Wrapper>
      <ChatContainer>
        <ChatList>
          <CharacterChat
            imgSrc={SampleFaceImage}
            level={9}
            name={"도날드덕"}
            text={"안녕 나는 도날드덕이야."}
          />
          <UserChat
            imgSrc={SampleProfileImage}
            username={"Tama1001"}
            nickname={"코드몽키"}
            text={"김치 먹어본 적 있어?"}
          />
          <CharacterChat
            imgSrc={SampleFaceImage}
            level={9}
            name={"도날드덕"}
            text={"최근에 먹어봤는데 아주 맛있게 먹었어요 ^_^"}
          />
          <UserChat
            imgSrc={SampleProfileImage}
            username={"Tama1001"}
            nickname={"코드몽키"}
            text={"엄청 덥다."}
          />
          <CharacterChat
            imgSrc={SampleFaceImage}
            level={9}
            name={"도날드덕"}
            text={"그러게요. 쪄 죽을 것 같아요."}
          />
        </ChatList>
      </ChatContainer>
      <ChatInputContainer>
        <ChatInput placeholder="메시지를 입력하세요." />
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
`;

const ChatList = tw.div`
w-full
h-full
grow-0
overflow-y-scroll
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