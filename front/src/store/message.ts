import { IMessage } from "@/models/message.interface";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const messageDataAtom = atom<IMessage[]>({
  key: "messageData",
  default: [
    {
      timestamp: new Date().toString(),
      text: "-- 깃마고치에 오신 것을 환영합니다. --",
    },
  ],
  effects_UNSTABLE: [persistAtom],
});
