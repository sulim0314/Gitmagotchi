import { IUser } from "@/models";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const userDataAtom = atom<IUser | null>({
  key: "userData",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
