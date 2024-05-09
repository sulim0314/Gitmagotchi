import { ICharacterStat } from "@/models";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const statDataAtom = atom<ICharacterStat | null>({
  key: "statData",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
