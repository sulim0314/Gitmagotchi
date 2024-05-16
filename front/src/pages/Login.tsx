import tw from "tailwind-styled-components";
import BabyImgFrame from "@/assets/images/baby.svg";
import { FaGithub } from "react-icons/fa";
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router";
import { useSetRecoilState } from "recoil";
import { messageDataAtom } from "@/store/message";

export default function Login() {
  const navigate = useNavigate();
  const setMessageData = useSetRecoilState(messageDataAtom);

  const signIn = async () => {
    await Auth.federatedSignIn({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      provider: "GitHub",
    });
    setMessageData([
      {
        timestamp: new Date().toString(),
        text: "-- 깃마고치에 오신 것을 환영합니다. --",
      },
    ]);
    navigate("/", { replace: true });
  };

  return (
    <Wrapper>
      <ImgContainer>
        <BabyImg src={BabyImgFrame} />
        <FaceImg src={"https://gitmagotchi-generated.s3.amazonaws.com/face.png"} />
      </ImgContainer>
      <Content>
        <Title>깃마고치</Title>
        <Description>생성형 AI를 통해</Description>
        <Description>나만의 다마고치를 키워보세요.</Description>
        <LoginButton onClick={signIn}>
          <GitHubIcon />
          <LoginText>GitHub로 로그인하기</LoginText>
        </LoginButton>
      </Content>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
lg:flex-row
lg:space-x-32
justify-center
items-center
`;

const ImgContainer = tw.div`
relative
w-80
h-80
-rotate-[30deg]
`;

const BabyImg = tw.img`
h-full
absolute
left-1/2
top-1/2
-translate-x-1/2
-translate-y-1/2
`;

const FaceImg = tw.img`
h-[10.2rem]
absolute
left-40
top-9
-translate-x-1/2
scale-[163%]
`;

const Content = tw.div`
pt-4
flex
flex-col
items-center
h-60
`;

const Title = tw.h1`
font-medium
text-3xl
mb-6
`;

const Description = tw.p`
text-base
text-slate-500
`;

const LoginButton = tw.button`
w-52
h-10
mt-10
rounded-lg
flex
items-center
justify-center
bg-gray-800
`;

const GitHubIcon = tw(FaGithub)`
w-4
h-4
mr-2
text-slate-100
`;

const LoginText = tw.h1`
text-slate-100
text-sm
`;
