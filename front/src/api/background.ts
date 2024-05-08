import { usInstance } from ".";
import { sampleBackground } from "./sample";

export const getBackgroundList = async (): Promise<any> => {
  //   const response = await usInstance.post("/collection", params);
  //   return response.data;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleBackground);
    }, 2000);
  });
};

export const generateBackground = async (params: any): Promise<any> => {
  const response = await usInstance.post("/background/ai", params);
  return response.data;
};
