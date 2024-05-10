import tw from "tailwind-styled-components";
import { IoSend } from "react-icons/io5";
import CharacterChat from "@/components/chat/CharacterChat";
import UserChat from "@/components/chat/UserChat";
import { useMutation } from "@tanstack/react-query";
import { getChatResponse, getChatSentiment } from "@/api/character";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { characterDataAtom } from "@/store/character";
import { userDataAtom } from "@/store/user";
import { ImExit } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { messageDataAtom } from "@/store/message";

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
  const navigate = useNavigate();
  const userData = useRecoilValue(userDataAtom);
  const characterData = useRecoilValue(characterDataAtom);
  const setMessageData = useSetRecoilState(messageDataAtom);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatMutation = useMutation({
    mutationFn: getChatResponse,
    onSuccess: (data) => getMessage(unicodeToChar(data)),
    onError: (err) => console.log(err),
  });
  const sentimentMutation = useMutation({
    mutationFn: getChatSentiment,
    onSuccess: (data) => {
      let text: string;
      if (data === "POSITIVE") {
        text = "대화을 통해 기분이 좋아져 친밀도가 상승했습니다 +5";
      } else if (data === "NEGATIVE") {
        text = "대화을 통해 기분이 안좋아져 친밀도가 하락했습니다 -5";
      }
      setMessageData((prev) => [
        ...prev,
        {
          timestamp: new Date().toString(),
          text,
        },
      ]);
      navigate("/");
    },
    onError: (err) => console.log(err),
  });

  const [chatMsg, setChatMsg] = useState<string>("");
  const [chatList, setChatList] = useState<IChat[]>([
    {
      isUser: false,
      imgSrc: characterData?.faceUrl || "",
      level: 9,
      name: characterData?.name || "",
      text: `안녕! 난 ${characterData?.name}(이)야.`,
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

    chatMutation.mutate({
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
    return text.replace(/\\u[\dA-F]{4}/gi, function (match) {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
    });
  };

  const exitChat = () => {
    sentimentMutation.mutate({
      source_text: chatList
        .filter((c) => !c.isUser)
        .map((c) => c.text)
        .join(" "),
    });
  };

  return (
    <Wrapper>
      <ChatContainer>
        <ExitButton onClick={exitChat}>
          <ExitIcon />
          <ExitButtonText>대화 종료하기</ExitButtonText>
        </ExitButton>
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
relative
`;

const ExitButton = tw.div`
cursor-pointer
absolute
top-4
right-4
lg:right-8
bg-purple-300
hover:bg-purple-400
hover:scale-110
flex
items-center
space-x-2
border-2
border-slate-800
rounded-2xl
p-3
lg:py-2
lg:px-4
`;

const ExitButtonText = tw.h3`
hidden
lg:block
text-lg
font-bold
`;

const ExitIcon = tw(ImExit)`
w-6
h-6`;

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
