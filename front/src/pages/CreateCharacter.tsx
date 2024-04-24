import tw from "tailwind-styled-components";
import { useState } from "react";
import CreateMethod from "@/components/CreateCharacter/CreateMethod";
import CreateByAi from "@/components/CreateCharacter/CreateByAi";
import CreateConfirm from "@/components/CreateCharacter/CreateConfirm";
import CreateResult from "@/components/CreateCharacter/CreateResult";

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
`;