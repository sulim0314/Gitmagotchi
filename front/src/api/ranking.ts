import { IRanking, Pageable } from "@/models";
import { seoulInstance } from ".";

export const getRankingList = async (params: {
  type: "BEST" | "WORST";
  page?: number;
  pageSize?: number;
}): Promise<Pageable<IRanking>> => {
  return seoulInstance.get("/users/rank", { params });
};

export const getMyRank = async (params: {
  type: "BEST" | "WORST";
}): Promise<{
  collectionCount: number;
  rank: number;
  id: number;
}> => {
  return seoulInstance.get("/users/rank/me", { params });
};
