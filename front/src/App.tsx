import tw from "tailwind-styled-components";
import { Route, Routes } from "react-router-dom";
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

export default function App() {
  return (
    <Wrapper className="linear">
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
          <Route path="/character/change" element={null} />
          <Route path="/background/create" element={<CreateBg />} />
        </Routes>
      </Content>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-screen
h-screen
flex
flex-col
bg-blue-100
`;

const Content = tw.div`
flex-grow
w-full
h-full
`;
