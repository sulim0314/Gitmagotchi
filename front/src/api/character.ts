import { ICharacter, InteractType } from "@/models";
import { seoulInstance, usInstance } from ".";

export const createCharacter = async (params: { body: string }): Promise<ICharacter> => {
  return seoulInstance.post("/characters", params);
};

export const getCharacter = async (params: { characterId: number }): Promise<ICharacter> => {
  return seoulInstance.get("/characters", { params });
};

export const searchCharacter = async (params: { name: string }): Promise<string> => {
  return seoulInstance.get("/characters", { params });
};

export const getChatResponse = async (params: { body: string }): Promise<string> => {
  return usInstance.post("/character/chat", params);
};
export const getTestResponse = async (params: { body: string }): Promise<string> => {
  return usInstance.post("/character/test", params);
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
  interactType: InteractType;
}> => {
  return seoulInstance.post("/characters/interaction", params);
};
