import { ICharacterStatus } from "@/models";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const statusDataAtom = atom<ICharacterStatus | null>({
  key: "statusData",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
