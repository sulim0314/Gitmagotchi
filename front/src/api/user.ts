import { IBackground, IUser } from "@/models";
import { seoulInstance } from ".";

export const getUser = async (params: { userId: string }): Promise<IUser> => {
  return seoulInstance.get("/users/me", { params });
};

export const getBackgroundList = async (params: {
  userId: number;
}): Promise<{ backgrounds: IBackground[] }> => {
  return seoulInstance.get("/users/background", { params });
};
