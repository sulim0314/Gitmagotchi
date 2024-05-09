import { usInstance } from ".";
import { sampleCharacter, sampleStat, sampleStatus } from "./sample";

export const getCharacter = async (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleCharacter);
    }, 2000);
  });
};

export const getStat = async (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleStat);
    }, 2000);
  });
};

export const getStatus = async (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleStatus);
    }, 2000);
  });
};

export const getChatResponse = async (params: { body: string }): Promise<string> => {
  return usInstance.post("/character/chat", params);
};

export const getChatSentiment = async (params: { source_text: string }): Promise<string> => {
  return usInstance.post("/character/chat/sentiment", params);
};

export const generateFace = async (params: { body: string }): Promise<{ imageUrl: string }> => {
  return usInstance.post("/character/face/ai", params);
};
