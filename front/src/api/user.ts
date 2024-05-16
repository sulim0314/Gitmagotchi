import { IBackground, IUser } from "@/models";
import { seoulInstance } from ".";

export const getUser = async (): Promise<IUser> => {
  return seoulInstance.get("/users/me");
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

export const getMeal = async (): Promise<{ message: string; value: number }> => {
  return seoulInstance.patch("/users/meal");
};

export const eatMeal = async (): Promise<{ id: number; meal: number }> => {
  return seoulInstance.patch("/users/eat");
};
