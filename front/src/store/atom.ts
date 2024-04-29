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
}

const defaultAuth: IAuth = {
  isLogin: false,
  user: null,
};

export const memberDataAtom = atom<IAuth>({
  key: "authData",
  default: defaultAuth,
  effects_UNSTABLE: [persistAtom],
});
