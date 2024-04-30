import { ICharacter } from "@/models";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

interface ICharacterData {
  character: ICharacter | null;
}

const defaultCharacter: ICharacterData = {
  character: null,
};

export const authDataAtom = atom<ICharacterData>({
  key: "characterData",
  default: defaultCharacter,
  effects_UNSTABLE: [persistAtom],
});
