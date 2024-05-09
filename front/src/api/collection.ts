import { ICollection } from "@/models";
import { seoulInstance } from ".";

export const searchCollection = async (params: {
  isCollection: boolean;
  isIndependent: boolean | null;
  orderBy: "LATEST" | "OLDEST";
}): Promise<ICollection[]> => {
  return seoulInstance.get("/collection", { params });
};
