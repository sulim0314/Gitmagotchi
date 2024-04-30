// import { axiosInstance } from ".";

import { sampleBackground } from "./sample";

export const getBackgroundList = async (params: any): Promise<any> => {
  //   const response = await axiosInstance.post("/collection", params);
  //   return response.data;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(sampleBackground);
    }, 2000);
  });
};
