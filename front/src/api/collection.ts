// import { axiosInstance } from ".";

import { sampleAward, sampleCollection } from "./sample";

export const getAwardList = async (): Promise<any> => {
  //   const response = await axiosInstance.post("/collection", params);
  //   return response.data;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleAward);
    }, 2000);
  });
};

export const getCollectionList = async (params: any): Promise<any> => {
  //   const response = await axiosInstance.post("/collection", params);
  //   return response.data;
  return new Promise((resolve) => {
    setTimeout(() => {
      if (params.menu === "TOTAL") {
        resolve(sampleCollection);
      } else if (params.menu === "AWARD") {
        resolve(sampleCollection.filter((c) => c.ending === "졸업"));
      } else if (params.menu === "DEATH") {
        console.log(sampleCollection.filter((c) => c.ending !== "졸업"));

        resolve(sampleCollection.filter((c) => c.ending !== "졸업"));
      }
    }, 2000);
  });
};
