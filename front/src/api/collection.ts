import { ICollection, Pageable } from "@/models";
import { seoulInstance } from ".";

export const searchCollection = async (params: {
  isCollection: boolean;
  isIndependent: boolean | null;
  orderBy: "LATEST" | "OLDEST";
  page?: number;
  pageSize?: number;
}): Promise<Pageable<ICollection>> => {
  return seoulInstance.get("/collection", { params });
};
