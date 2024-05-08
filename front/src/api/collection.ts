// import { usInstance } from ".";

import { seoulInstance } from ".";
import { sampleCollection } from "./sample";

export const searchCollection = async (params: any): Promise<any> => {
  const response = await seoulInstance.get("/collection", { params });
  return response.data;
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(sampleAward);
  //   }, 2000);
  // });
};

export const getCollectionList = async (params: any): Promise<any> => {
  //   const response = await usInstance.post("/collection", params);
  //   return response.data;
  return new Promise((resolve) => {
    setTimeout(() => {
      if (params.menu === "TOTAL") {
        resolve(sampleCollection);
      } else if (params.menu === "AWARD") {
        resolve(sampleCollection.filter((c) => c.ending === "INDEPENDENT"));
      } else if (params.menu === "DEATH") {
        console.log(sampleCollection.filter((c) => c.ending !== "INDEPENDENT"));

        resolve(sampleCollection.filter((c) => c.ending !== "INDEPENDENT"));
      }
    }, 2000);
  });
};
