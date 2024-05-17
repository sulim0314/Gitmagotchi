import { IRanking, Pageable } from "@/models";
import { seoulInstance } from ".";

export const getRankingList = async (params: {
  type: "BEST" | "WORST";
  page?: number;
  pageSize?: number;
}): Promise<Pageable<IRanking>> => {
  return seoulInstance.get("/users/rank", { params });
};

export const getMyRank = async (): Promise<string> => {
  return seoulInstance.get("/users/rank/me");
};
