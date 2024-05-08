import { IAuth } from "@/models";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const authDataAtom = atom<IAuth | null>({
  key: "authData",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
