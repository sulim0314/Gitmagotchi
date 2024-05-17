import tw from "tailwind-styled-components";
import { useEffect, useRef, useState } from "react";
import CreateMethod from "@/components/createCharacter/CreateMethod";
import CreateByAi from "@/components/createCharacter/CreateByAi";
import CreateConfirm from "@/components/createCharacter/CreateConfirm";
import CreateResult from "@/components/createCharacter/CreateResult";
import { useMutation } from "@tanstack/react-query";
import { createCharacter } from "@/api/character";
import { AnimatePresence, motion } from "framer-motion";

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
      return (
        <motion.div
          key={0}
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -500, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          <CreateMethod key={0} setProcess={setProcess} />
        </motion.div>
      );
    } else if (process === 1) {
      return (
        <motion.div
          key={1}
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -500, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          <CreateByAi
            setProcess={setProcess}
            setCreatedUrl={setCreatedUrl}
            createdRef={createdRef}
          />
        </motion.div>
      );
    } else if (process === 2) {
      return (
        <motion.div
          key={1}
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -500, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          <CreateConfirm
            key={2}
            setProcess={setProcess}
            faceUrl={createdUrl}
            createdName={createdName}
            setCreatedName={setCreatedName}
            createCharacter={mutation.mutate}
          />
        </motion.div>
      );
    } else if (process === 3) {
      return (
        <motion.div
          key={1}
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -500, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          <CreateResult
            key={3}
            createdId={createdId}
            createdName={createdName}
            faceUrl={createdUrl}
          />
        </motion.div>
      );
    }
  };
  return (
    <Wrapper>
      <AnimatePresence mode="wait" initial={false}>
        {renderProcess()}
      </AnimatePresence>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
`;
