import tw from "tailwind-styled-components";
import { Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Navbar from "@/components/common/Navber";
import CreateCharacter from "@/pages/CreateCharacter";

export default function App() {
  return (
    <Wrapper className="linear">
      <Navbar />
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/character/create" element={<CreateCharacter />} />
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
