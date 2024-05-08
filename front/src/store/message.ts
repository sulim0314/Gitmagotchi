import { IMessage } from "@/models/message.interface";
import { atom } from "recoil";

export const messageDataAtom = atom<IMessage[]>({
  key: "messageData",
  default: [
    {
      timestamp: new Date(),
      text: "-- 깃마고치에 오신 것을 환영합니다. --",
    },
  ],
});
