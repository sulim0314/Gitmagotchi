import tw from "tailwind-styled-components";
import { useState } from "react";
import CreateMethod from "@/components/createCharacter/CreateMethod";
import CreateByAi from "@/components/createCharacter/CreateByAi";
import CreateConfirm from "@/components/createCharacter/CreateConfirm";
import CreateResult from "@/components/createCharacter/CreateResult";

export default function CreateCharacter() {
  const [process, setProcess] = useState<number>(0);

  const renderProcess = () => {
    if (process === 0) {
      return <CreateMethod setProcess={setProcess} />;
    } else if (process === 1) {
      return <CreateByAi setProcess={setProcess} />;
    } else if (process === 2) {
      return <CreateConfirm setProcess={setProcess} />;
    } else if (process === 3) {
      return <CreateResult />;
    }
  };
  return <Wrapper>{renderProcess()}</Wrapper>;
}

const Wrapper = tw.div`
w-full
h-full
bg-[#f2f2f2]
`;
