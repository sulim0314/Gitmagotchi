import tw from "tailwind-styled-components";
import { useState } from "react";
import CreateMethod from "@/components/CreateBg/CreateMethod";
import CreateByAi from "@/components/CreateBg/CreateByAi";
import CreateResult from "@/components/CreateBg/CreateResult";
import CreateByUpload from "@/components/CreateBg/CreateByUpload";

export default function CreateBg() {
  const [process, setProcess] = useState<number>(0);

  const renderProcess = () => {
    if (process === 0) {
      return <CreateMethod setProcess={setProcess} />;
    } else if (process === 1) {
      return <CreateByAi setProcess={setProcess} />;
    } else if (process === 2) {
      return <CreateByUpload setProcess={setProcess} />;
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
