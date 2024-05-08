// import { usInstance } from ".";

import { sampleCharacterList, sampleUserList } from "./sample";

export const getSearchList = async (params: any): Promise<any> => {
  //   const response = await usInstance.post("/collection", params);
  //   return response.data;
  return new Promise((resolve) => {
    setTimeout(() => {
      if (params.type === "CHARACTER") {
        resolve(sampleCharacterList);
      } else {
        resolve(sampleUserList);
      }
    }, 2000);
  });
};
