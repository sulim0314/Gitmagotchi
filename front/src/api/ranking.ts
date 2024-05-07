// import { usInstance } from ".";

import { sampleRanking } from "./sample";

export const getRankingList = async (): Promise<any> => {
  //   const response = await usInstance.post("/collection", params);
  //   return response.data;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleRanking);
    }, 2000);
  });
};
