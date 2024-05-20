import tw from "tailwind-styled-components";
import { useRef, useState } from "react";
import CreateMethod from "@/components/createBg/CreateMethod";
import CreateByAi from "@/components/createBg/CreateByAi";
import CreateResult from "@/components/createBg/CreateResult";
import CreateByUpload from "@/components/createBg/CreateByUpload";
import sampleBgImage from "@/assets/images/sampleBg.jpg";
import { AnimatePresence, motion } from "framer-motion";

export default function CreateBg() {
  const [process, setProcess] = useState<number>(0);
  const [createdUrl, setCreatedUrl] = useState<string>(sampleBgImage);
  const createdRef = useRef<HTMLImageElement>(new Image());

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
          <CreateMethod setProcess={setProcess} />
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
          key={2}
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -500, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          <CreateByUpload
            setProcess={setProcess}
            setCreatedUrl={setCreatedUrl}
          />
        </motion.div>
      );
    } else if (process === 3) {
      return (
        <motion.div
          key={3}
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -500, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          <CreateResult bgUrl={createdUrl} />
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
