import tw from "tailwind-styled-components";
import { useState } from "react";
import CreateMethod from "@/components/createCharacter/CreateMethod";
import CreateByAi from "@/components/createCharacter/CreateByAi";
import CreateConfirm from "@/components/createCharacter/CreateConfirm";
import CreateResult from "@/components/createCharacter/CreateResult";
import sampleFace2 from "@/assets/images/sampleFace2.png";
import { useMutation } from "@tanstack/react-query";
import { createCharacter } from "@/api/character";

export default function CreateCharacter() {
  const [process, setProcess] = useState<number>(0);
  const [createdUrl, setCreatedUrl] = useState<string>(sampleFace2);
  const [createdName, setCreatedName] = useState<string>("");

  const mutation = useMutation({
    mutationFn: createCharacter,
    onSuccess: (data) => {
      console.log(data);
      setProcess(3);
    },
    onError: (err) => console.log(err),
  });

  const renderProcess = () => {
    if (process === 0) {
      return <CreateMethod setProcess={setProcess} />;
    } else if (process === 1) {
      return <CreateByAi setProcess={setProcess} setCreatedUrl={setCreatedUrl} />;
    } else if (process === 2) {
      return (
        <CreateConfirm
          setProcess={setProcess}
          faceUrl={createdUrl}
          createdName={createdName}
          setCreatedName={setCreatedName}
          createCharacter={mutation.mutate}
        />
      );
    } else if (process === 3) {
      return <CreateResult faceUrl={createdUrl} createdName={createdName} />;
    }
  };
  return <Wrapper>{renderProcess()}</Wrapper>;
}

const Wrapper = tw.div`
w-full
h-full
`;
