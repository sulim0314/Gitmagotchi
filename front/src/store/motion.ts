import { IMotion } from "@/models";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const motionDataAtom = atom<IMotion | null>({
  key: "motionData",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
