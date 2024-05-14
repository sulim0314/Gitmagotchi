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
import CharacterRename from "@/pages/CharacterRename";
import Minigame from "@/pages/Minigame";
import DeleteCharacterConfirm from "@/pages/DeleteCharacterConfirm";
import BackgroundImage from "@/assets/images/background.svg";
import SampleBg from "@/assets/images/sampleBg2.jpg";
import { authDataAtom } from "@/store/auth";
import { useRecoilState } from "recoil";
import { useEffect, useRef, useState } from "react";
import { userDataAtom } from "@/store/user";
import { characterDataAtom } from "@/store/character";
import { Auth } from "aws-amplify";
import { getUser } from "@/api/user";
import { getCharacter } from "@/api/character";
import EditProfile from "@/pages/EditProfile";
import { IAuth } from "@/models";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const [authData, setAuthData] = useRecoilState(authDataAtom);
  const [userData, setUserData] = useRecoilState(userDataAtom);
  const [characterData, setCharacterData] = useRecoilState(characterDataAtom);
  const [loading, setLoading] = useState<boolean>(false);

  const frameRef = useRef<HTMLImageElement>(new Image());
  const [frameLoaded, setFrameLoaded] = useState<boolean>(false);
  const bgRef = useRef<HTMLImageElement>(new Image());
  const [bgLoaded, setBgLoaded] = useState<boolean>(false);

  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    frameRef.current.src = BackgroundImage;
    frameRef.current.onload = () => {
      setFrameLoaded(true);
    };
    bgRef.current.onload = () => {
      setBgLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!userData) return;
    bgRef.current.src = userData.backgroundUrl;
    bgRef.current.onload = () => {
      setBgLoaded(true);
    };
  }, [userData]);

  useEffect(() => {
    setLoading(true);
    const fetchCognitoUser = async () => {
      const cognitoUser: IAuth = await Auth.currentUserInfo();
      if (cognitoUser) {
        setAuthData(cognitoUser);
      } else {
        setLoading(false);
        navigate("/login", { replace: true });
      }
    };

    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        setUserData(user);
      } else {
        timeoutId.current = setTimeout(fetchUser, 1000);
      }
    };

    const fetchCharacter = async () => {
      if (!userData) return;
      if (userData.characterId === null) {
        setLoading(false);
        navigate("/character/create", { replace: true });
      } else {
        const character = await getCharacter({ characterId: userData?.characterId });
        setCharacterData(character);
        setUserData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            characterId: character.characterId,
          };
        });
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

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [authData, setAuthData, userData, setUserData, characterData, setCharacterData, navigate]);

  useEffect(() => {
    if (characterData?.characterId) {
      intervalId.current = setInterval(() => {}, 3_600_000);
    }
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [characterData?.characterId]);

  if (loading || !frameLoaded || (userData && !bgLoaded)) return <div>Loading...</div>;

  return (
    <>
      {location.pathname === "/" && (
        <>
          <Background
            style={{
              backgroundImage: `url(${userData?.backgroundUrl || SampleBg})`,
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
            <Route path="/login" element={<Login />} />
            <Route path="/character/create" element={<CreateCharacter />} />
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/award" element={<Award />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/changebg" element={<ChangeBg />} />
            <Route path="/search" element={<Search />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/editProfile" element={<EditProfile />} />
            <Route path="/character" element={<CharacterMenu />} />
            <Route path="/character/chat" element={<Chat />} />
            <Route path="/character/stat" element={<CharacterStat />} />
            <Route path="/character/rename" element={<CharacterRename />} />
            <Route path="/character/game" element={<Minigame />} />
            <Route path="/character/change" element={null} />
            <Route path="/character/delete" element={<DeleteCharacterConfirm />} />
            <Route path="/background/create" element={<CreateBg />} />
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
overflow-hidden
`;

const Content = tw.div`
flex-grow
w-full
flex
flex-col
`;
