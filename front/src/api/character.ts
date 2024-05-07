import { usInstance } from ".";
import { sampleCharacter } from "./sample";

export const getCharacter = async (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleCharacter);
    }, 2000);
  });
};

export const getChatResponse = async (params: any): Promise<any> => {
  const response = await usInstance.post("/character/chat", params);
  return response.data;
};

export const generateFace = async (params: any): Promise<any> => {
  const response = await usInstance.post("/character/face/ai", params);
  return response.data;
};
