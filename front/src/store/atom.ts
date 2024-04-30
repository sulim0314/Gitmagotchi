import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

interface IUser {
  name: string;
  email: string;
  id: string;
}

interface IAuth {
  isLogin: boolean;
  user: IUser | null;
  characterId: string | null;
}

const defaultAuth: IAuth = {
  isLogin: false,
  user: null,
  characterId: null,
};

export const authDataAtom = atom<IAuth>({
  key: "authData",
  default: defaultAuth,
  effects_UNSTABLE: [persistAtom],
});
