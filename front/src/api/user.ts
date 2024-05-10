import { IBackground, IUser } from "@/models";
import { seoulInstance } from ".";

export const getUser = async (params: { userId: string }): Promise<IUser> => {
  return seoulInstance.get("/users/me", { params });
};

export const modifyUser = async (params: {
  body: string;
}): Promise<{ id: number; nickname: string; profileImg: string | null }> => {
  return seoulInstance.patch("/users/me", params);
};

export const getBackgroundList = async (params: {
  userId: number;
}): Promise<{ backgrounds: IBackground[] }> => {
  return seoulInstance.get("/users/background", { params });
};

export const gainGold = async (params: {
  userId: number;
  value: number;
}): Promise<{ value: number }> => {
  return seoulInstance.patch("/users/gold", params);
};

export const changeBackground = async (params: { body: string }): Promise<{ message: string }> => {
  return seoulInstance.patch("/users/background", params);
};
