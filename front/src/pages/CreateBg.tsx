import tw from "tailwind-styled-components";
import { useState } from "react";
import CreateMethod from "@/components/createBg/CreateMethod";
import CreateByAi from "@/components/createBg/CreateByAi";
import CreateResult from "@/components/createBg/CreateResult";
import CreateByUpload from "@/components/createBg/CreateByUpload";
import sampleBgImage from "@/assets/images/sampleBg.jpg";

export default function CreateBg() {
  const [process, setProcess] = useState<number>(0);
  const [createdUrl, setCreatedUrl] = useState<string>(sampleBgImage);

  const renderProcess = () => {
    if (process === 0) {
      return <CreateMethod setProcess={setProcess} />;
    } else if (process === 1) {
      return (
        <CreateByAi setProcess={setProcess} setCreatedUrl={setCreatedUrl} />
      );
    } else if (process === 2) {
      return <CreateByUpload setProcess={setProcess} />;
    } else if (process === 3) {
      return <CreateResult bgUrl={createdUrl} />;
    }
  };
  return <Wrapper>{renderProcess()}</Wrapper>;
}

const Wrapper = tw.div`
w-full
h-full
`;
