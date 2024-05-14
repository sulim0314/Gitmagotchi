import tw from "tailwind-styled-components";
import { useEffect, useRef, useState } from "react";
import CreateMethod from "@/components/createCharacter/CreateMethod";
import CreateByAi from "@/components/createCharacter/CreateByAi";
import CreateConfirm from "@/components/createCharacter/CreateConfirm";
import CreateResult from "@/components/createCharacter/CreateResult";
import { useMutation } from "@tanstack/react-query";
import { createCharacter } from "@/api/character";

export default function CreateCharacter() {
  const [process, setProcess] = useState<number>(0);
  const [createdUrl, setCreatedUrl] = useState<string>(
    "https://gitmagotchi-generated.s3.amazonaws.com/face.png"
  );
  const [createdName, setCreatedName] = useState<string>("");
  const [createdId, setCreatedId] = useState<number | null>(null);
  const createdRef = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    if (createdId) {
      setProcess(3);
    }
  }, [createdId]);

  const mutation = useMutation({
    mutationFn: createCharacter,
    onSuccess: (data) => {
      setCreatedId(data.characterId);
    },
    onError: (err) => console.log(err),
  });

  const renderProcess = () => {
    if (process === 0) {
      return <CreateMethod setProcess={setProcess} />;
    } else if (process === 1) {
      return (
        <CreateByAi setProcess={setProcess} setCreatedUrl={setCreatedUrl} createdRef={createdRef} />
      );
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
      return <CreateResult createdId={createdId} createdName={createdName} faceUrl={createdUrl} />;
    }
  };
  return <Wrapper>{renderProcess()}</Wrapper>;
}

const Wrapper = tw.div`
w-full
h-full
`;
