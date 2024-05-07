import { ICharacter } from "@/models";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const characterDataAtom = atom<ICharacter | null>({
  key: "characterData",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
