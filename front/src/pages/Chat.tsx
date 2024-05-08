import tw from "tailwind-styled-components";
import { IoSend } from "react-icons/io5";
import CharacterChat from "@/components/chat/CharacterChat";
import UserChat from "@/components/chat/UserChat";
import { useMutation } from "@tanstack/react-query";
import { getChatResponse } from "@/api/character";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { characterDataAtom } from "@/store/character";
import { userDataAtom } from "@/store/user";

interface IUserChat {
  isUser: boolean;
  imgSrc: string;
  username: string;
  nickname: string;
  text: string;
}

interface ICharacterChat {
  isUser: boolean;
  imgSrc: string;
  level: number;
  name: string;
  text: string;
}

type IChat = IUserChat | ICharacterChat;

export default function Chat() {
  const userData = useRecoilValue(userDataAtom);
  const characterData = useRecoilValue(characterDataAtom);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const mutation = useMutation({
    mutationFn: getChatResponse,
    onSuccess: (data) => getMessage(unicodeToChar(data.body)),
    onError: (err) => console.log(err),
  });

  const [chatMsg, setChatMsg] = useState<string>("");
  const [chatList, setChatList] = useState<IChat[]>([
    {
      isUser: false,
      imgSrc: characterData?.faceUrl || "",
      level: 9,
      name: characterData?.name || "",
      text: `안녕! 난 ${characterData?.name}이야.`,
    },
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatList]);

  const onChangeMsg: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setChatMsg(e.target.value);
  };

  const sendMessage: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setChatMsg("");

    setChatList((prev) => [
      ...prev,
      {
        isUser: true,
        imgSrc: userData?.profileImg || "",
        username: userData?.githubUsername || "",
        nickname: userData?.nickname || "",
        text: chatMsg,
      },
    ]);

    mutation.mutate({
      body: JSON.stringify({
        characterInfo: {
          name: characterData?.name,
          level: Math.floor((characterData?.exp || 0) / 100),
          fullness: 70,
          intimacy: 80,
          cleanliness: 60,
        },
        userInput: chatMsg,
      }),
    });
  };

  const getMessage = (data: string) => {
    setChatList((prev) => [
      ...prev,
      {
        isUser: false,
        imgSrc: characterData?.faceUrl || "",
        level: Math.floor((characterData?.exp || 0) / 100),
        name: characterData?.name || "",
        text: data,
      },
    ]);
  };

  const unicodeToChar = (text: string) => {
    return text.slice(1, -1).replace(/\\u[\dA-F]{4}/gi, function (match) {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
    });
  };

  return (
    <Wrapper>
      <ChatContainer>
        <ChatList>
          {chatList.map((c, i) => {
            if (c.isUser) {
              return (
                <UserChat
                  key={i}
                  imgSrc={(c as IUserChat).imgSrc}
                  username={(c as IUserChat).username}
                  nickname={(c as IUserChat).nickname}
                  text={(c as IUserChat).text}
                />
              );
            } else {
              return (
                <CharacterChat
                  key={i}
                  imgSrc={(c as ICharacterChat).imgSrc}
                  level={(c as ICharacterChat).level}
                  name={(c as ICharacterChat).name}
                  text={(c as ICharacterChat).text}
                />
              );
            }
          })}
          <div ref={chatBottomRef} />
        </ChatList>
      </ChatContainer>
      <ChatInputContainer onSubmit={sendMessage}>
        <ChatInput placeholder="메시지를 입력하세요." onChange={onChangeMsg} value={chatMsg} />
        <button>
          <SendIcon />
        </button>
      </ChatInputContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
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

const ChatInputContainer = tw.form`
w-full
p-4
relative
`;

const ChatInput = tw.input`
h-12
w-full
rounded-3xl
border-2
border-slate-800
bg-slate-50
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
