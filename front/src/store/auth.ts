import { IUser } from "@/models";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

interface IAuthData {
  isLogin: boolean;
  user: IUser | null;
  characterId: string | null;
}

const defaultAuth: IAuthData = {
  isLogin: false,
  user: null,
  characterId: null,
};

export const authDataAtom = atom<IAuthData>({
  key: "authData",
  default: defaultAuth,
  effects_UNSTABLE: [persistAtom],
});
