import tw from "tailwind-styled-components";
import SampleStartCharacterImage from "@/assets/images/sampleStartCharacter.png";
import { FaGithub } from "react-icons/fa";
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();

  const signIn = async () => {
    await Auth.federatedSignIn({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      provider: "GitHub",
    });
    navigate("/", { replace: true });
  };

  // const handleLogin = () => {};

  return (
    <Wrapper>
      <img src={SampleStartCharacterImage} className="w-60" />
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

const Content = tw.div`
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
