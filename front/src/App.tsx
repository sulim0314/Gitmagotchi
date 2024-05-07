import tw from "tailwind-styled-components";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Navbar from "@/components/common/Navber";
import Collection from "@/pages/Collection";
import Award from "@/pages/Award";
import Ranking from "@/pages/Ranking";
import ChangeBg from "@/pages/ChangeBg";
import Search from "@/pages/Search";
import MyPage from "@/pages/MyPage";
import CreateCharacter from "@/pages/CreateCharacter";
import CreateBg from "@/pages/CreateBg";
import CharacterMenu from "@/pages/CharacterMenu";
import Chat from "@/pages/Chat";
import CharacterStat from "@/pages/CharacterStat";
import CharacterRename from "@/pages/CharactetRename";
import Test from "@/pages/Test";
import BackgroundImage from "@/assets/images/background.svg";
import SampleBg from "@/assets/images/sampleBg2.jpg";
import Minigame from "@/pages/Minigame";
import { authDataAtom } from "./store/auth";
import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { userDataAtom } from "./store/user";
import { characterDataAtom } from "./store/character";
import { Auth } from "aws-amplify";
import { getUser } from "./api/user";
import { getCharacter } from "./api/character";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [authData, setAuthData] = useRecoilState(authDataAtom);
  const [userData, setUserData] = useRecoilState(userDataAtom);
  const [characterData, setCharacterData] = useRecoilState(characterDataAtom);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);

    const fetchCognitoUser = async () => {
      const cognitoUser = await Auth.currentUserInfo();
      if (cognitoUser) {
        setAuthData(cognitoUser);
      } else {
        navigate("/login", { replace: true });
      }
    };

    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        setUserData(user);
      } else {
        // const newUser = createUser();
        setUserData(null);
      }
    };

    const fetchCharacter = async () => {
      const character = await getCharacter();
      if (character) {
        setCharacterData(character);
      } else {
        navigate("/character/create", { replace: true });
      }
    };

    if (!authData) {
      fetchCognitoUser();
    } else if (!userData) {
      fetchUser();
    } else if (!characterData) {
      fetchCharacter();
    } else {
      setLoading(false);
    }
  }, [authData, setAuthData, userData, setUserData, characterData, setCharacterData, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {location.pathname === "/" && (
        <>
          <Background
            style={{
              backgroundImage: `url(${SampleBg})`,
            }}
          />
          <BackgroundFrame
            style={{
              backgroundImage: `url(${BackgroundImage})`,
            }}
          />
          <White />
        </>
      )}

      <Wrapper>
        <Navbar />
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/award" element={<Award />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/changebg" element={<ChangeBg />} />
            <Route path="/search" element={<Search />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/character" element={<CharacterMenu />} />
            <Route path="/character/create" element={<CreateCharacter />} />
            <Route path="/character/chat" element={<Chat />} />
            <Route path="/character/stat" element={<CharacterStat />} />
            <Route path="/character/rename" element={<CharacterRename />} />
            <Route path="/character/game" element={<Minigame />} />
            <Route path="/character/change" element={null} />
            <Route path="/background/create" element={<CreateBg />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </Content>
      </Wrapper>
    </>
  );
}

const Background = tw.div`
absolute
top-0
left-0
w-screen
h-screen
bg-cover
bg-no-repeat
bg-center
-z-20
`;

const BackgroundFrame = tw.div`
absolute
top-0
left-0
w-screen
h-screen
bg-cover
bg-no-repeat
bg-center
-z-10
`;

const White = tw.div`
absolute
top-0
left-0
w-screen
h-screen
bg-slate-50/20
`;

const Wrapper = tw.div`
w-screen
h-screen
flex
flex-col
bg-cover
bg-no-repeat
bg-center
absolute
left-0
top-0
`;

const Content = tw.div`
flex-grow
w-full
`;
