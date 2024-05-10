import { seoulInstance } from ".";

export const getRankingList = async (params: {
  type: "BEST" | "WORST";
  page?: number;
  pageSize?: number;
}): Promise<any> => {
  return seoulInstance.get("/users/rank", { params });
};
