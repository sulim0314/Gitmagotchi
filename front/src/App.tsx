import tw from "tailwind-styled-components";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Navbar from "@/components/common/Navber";
import Collection from "@/pages/Collection";
import Award from "@/pages/Award";
import Ranking from "@/pages/Ranking";
import Search from "@/pages/Search";
import MyPage from "@/pages/MyPage";
import CreateCharacter from "@/pages/CreateCharacter";
import CreateBg from "@/pages/CreateBg";
import CharacterMenu from "@/pages/CharacterMenu";
import Chat from "@/pages/Chat";
import CharacterStat from "@/pages/CharacterStat";
import CharacterRename from "@/pages/CharacterRename";
import Minigame from "@/pages/Minigame";
import BackgroundImage from "@/assets/images/background.svg";
import SampleBg from "@/assets/images/sampleBg2.jpg";
import { authDataAtom } from "@/store/auth";
import { useRecoilState } from "recoil";
import { useEffect, useRef, useState } from "react";
import { userDataAtom } from "@/store/user";
import { characterDataAtom } from "@/store/character";
import { Auth } from "aws-amplify";
import { getUser } from "@/api/user";
import {
  applyCharacter,
  getCharacter,
  getMotion,
  offline,
} from "@/api/character";
import EditProfile from "@/pages/EditProfile";
import { IAuth } from "@/models";
import CharacterEnding from "@/pages/CharacterEnding";
import DeleteCharacterConfirm from "@/pages/DeleteCharacterConfirm";
import Background from "@/pages/Background";
import { useQuery } from "@tanstack/react-query";
import { expHandler } from "@/util/value";
import { motionDataAtom } from "@/store/motion";
import Loading from "@/components/common/Loading";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const [motionData, setMotionData] = useRecoilState(motionDataAtom);
  const [authData, setAuthData] = useRecoilState(authDataAtom);
  const [userData, setUserData] = useRecoilState(userDataAtom);
  const [characterData, setCharacterData] = useRecoilState(characterDataAtom);
  const [loading, setLoading] = useState<boolean>(false);

  const frameRef = useRef<HTMLImageElement>(new Image());
  const [frameLoaded, setFrameLoaded] = useState<boolean>(false);
  const bgRef = useRef<HTMLImageElement>(new Image());
  const [bgLoaded, setBgLoaded] = useState<boolean>(false);
  const [isWalking, setIsWalking] = useState<boolean>(false);

  const statIntervalId = useRef<NodeJS.Timeout | null>(null);
  const cleannessIntervalId = useRef<NodeJS.Timeout | null>(null);

  const { data } = useQuery({
    queryKey: [
      "motion",
      characterData ? characterData.characterId : "",
      characterData ? expHandler(characterData.exp).level : 0,
    ],
    queryFn: () => {
      if (!characterData) return null;
      return getMotion({
        characterId: characterData.characterId,
        requiredLevel: expHandler(characterData.exp).level,
        characterExp: characterData.exp,
      });
    },
  });

  useEffect(() => {
    frameRef.current.src = BackgroundImage;
    frameRef.current.onload = () => {
      setFrameLoaded(true);
    };
    bgRef.current.onload = () => {
      setBgLoaded(true);
    };

    return () => {
      offline();
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
        const character = await getCharacter({
          characterId: userData?.characterId,
        });
        setCharacterData(character);
        setUserData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            characterId: character.characterId,
          };
        });
        navigate("/", { replace: true });
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
  }, [
    authData,
    setAuthData,
    userData,
    setUserData,
    characterData,
    setCharacterData,
    navigate,
  ]);

  useEffect(() => {
    if (characterData?.characterId) {
      const cleannessLevel = characterData.stat.cleannessStat;
      statIntervalId.current = setInterval(() => {
        setCharacterData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: {
              ...prev.status,
              fullness: prev.status.fullness - 1,
              intimacy: prev.status.intimacy - 1,
            },
          };
        });
      }, 7_200_000);
      cleannessIntervalId.current = setInterval(() => {
        setCharacterData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: {
              ...prev.status,
              cleanness: prev.status.cleanness - 1,
            },
          };
        });
      }, (cleannessLevel + 1) * 3_600_000);
    }
    return () => {
      if (statIntervalId.current) {
        clearInterval(statIntervalId.current);
      }
      if (cleannessIntervalId.current) {
        clearInterval(cleannessIntervalId.current);
      }
    };
  }, [
    characterData?.characterId,
    characterData?.stat.cleannessStat,
    setCharacterData,
  ]);

  useEffect(() => {
    if (characterData) {
      applyCharacter({
        body: JSON.stringify({
          exp: characterData.exp,
          stat: characterData.stat,
          status: characterData.status,
        }),
      });
      if (
        characterData.exp >= 230 ||
        characterData.status.cleanness <= 0 ||
        characterData.status.intimacy <= 0 ||
        characterData.status.fullness <= 0
      ) {
        navigate("/character/ending");
      }
    }
  }, [characterData, navigate]);

  useEffect(() => {
    if (data) {
      setMotionData(data);
    }
  }, [data, setMotionData]);

  useEffect(() => {
    function preloading(imageArray: string[]) {
      imageArray.forEach((url) => {
        const image = new Image();
        image.src = url;
      });
    }
    if (motionData && motionData.motion.length > 0) {
      preloading([
        motionData.hello.motion,
        motionData.default.motion,
        motionData.meal.motion,
        motionData.shower.motion,
        motionData.walk.motion,
        ...motionData.motion.map((m) => m.motion),
      ]);
    }
  }, [motionData]);

  if (loading || !frameLoaded || (userData && !bgLoaded)) return <Loading />;

  return (
    <>
      {location.pathname === "/" && (
        <>
          <UserBackground
            style={{
              backgroundImage: `url(${userData?.backgroundUrl || SampleBg})`,
            }}
          />
          {!isWalking && (
            <BackgroundFrame
              style={{
                backgroundImage: `url(${BackgroundImage})`,
              }}
            />
          )}
          <White />
        </>
      )}

      <Wrapper>
        {userData ? <Navbar /> : <NavBarBlock />}
        <Content>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/character/create" element={<CreateCharacter />} />
            <Route
              path="/"
              element={
                <Home isWalking={isWalking} setIsWalking={setIsWalking} />
              }
            />
            <Route path="/collection" element={<Collection />} />
            <Route path="/award" element={<Award />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/search" element={<Search />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/editProfile" element={<EditProfile />} />
            <Route path="/character" element={<CharacterMenu />} />
            <Route path="/character/chat" element={<Chat />} />
            <Route path="/character/stat" element={<CharacterStat />} />
            <Route path="/character/rename" element={<CharacterRename />} />
            <Route path="/character/game" element={<Minigame />} />
            <Route path="/character/ending" element={<CharacterEnding />} />
            <Route
              path="/character/delete"
              element={<DeleteCharacterConfirm />}
            />
            <Route path="/background" element={<Background />} />
            <Route path="/background/create" element={<CreateBg />} />
          </Routes>
        </Content>
      </Wrapper>
    </>
  );
}

const UserBackground = tw.div`
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

const NavBarBlock = tw.div`
flex
justify-between
items-center
h-24
min-h-24
w-full
mx-auto
px-4
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
