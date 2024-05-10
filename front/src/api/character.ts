import { ICharacter, ICharacterStat, ICharacterStatus } from "@/models";
import { seoulInstance, usInstance } from ".";
import { sampleCharacter, sampleStat, sampleStatus } from "./sample";

export const getCharacter = async (): Promise<ICharacter> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleCharacter);
    }, 2000);
  });
};

export const searchCharacter = async (params: {
  characterId?: number;
  name?: string;
}): Promise<string> => {
  return seoulInstance.get("/characters", { params });
};

export const getStat = async (): Promise<ICharacterStat> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleStat);
    }, 2000);
  });
};

export const getStatus = async (): Promise<ICharacterStatus> => {
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

export const getInteractionResult = async (params: {
  body: string;
}): Promise<{
  exp: number;
  fullness: number;
  intimacy: number;
  cleanness: number;
}> => {
  return seoulInstance.post("/characters/interaction", params);
};
