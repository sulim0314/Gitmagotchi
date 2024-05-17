import { ICharacter, IMotion, InteractType } from "@/models";
import { seoulInstance, usInstance } from ".";

export const createCharacter = async (params: {
  body: string;
}): Promise<{ characterId: number }> => {
  return seoulInstance.post("/characters", params);
};

export const getCharacter = async (params: {
  characterId: number;
}): Promise<ICharacter> => {
  return seoulInstance.get("/characters", { params });
};

export const modifyCharacter = async (params: {
  body: string;
}): Promise<{ message: string }> => {
  return seoulInstance.patch("/characters", params);
};

export const deleteCharacter = async (): Promise<{ message: string }> => {
  return seoulInstance.delete("/characters");
};

export const applyCharacter = async (params: {
  body: string;
}): Promise<{ message: string }> => {
  return seoulInstance.put("/characters/apply", params);
};

export const endingCharacter = async (params: {
  body: string;
}): Promise<{ message: string }> => {
  return seoulInstance.post("/characters/ending", params);
};

export const getCharacterMotion = async (params: {
  characterId: number;
  requiredLevel: number;
  characterExp: number;
}): Promise<{ message: string }> => {
  return seoulInstance.post("/characters/image", params);
};

export const createAnimation = async (params: {
  characterId: number;
  requiredLevel: number;
}): Promise<string> => {
  return seoulInstance.post("/characters/motion", params);
};

// export const generateFace = async (params: { body: string }): Promise<{ imageUrl: string }> => {
//   return usInstance.post("/character/face/ai", params);
// };
export const generateFace = async (params: {
  body: string;
}): Promise<{ imageUrl: string }> => {
  return usInstance.post("/character/face/ai/java", params);
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

export const getMotion = async (params: {
  characterId: number;
  requiredLevel: number;
  characterExp: number;
}): Promise<IMotion> => {
  return seoulInstance.post("/characters/image", params);
};

export const getChatSentiment = async (params: {
  body: string;
}): Promise<string> => {
  return usInstance.post("/character/chat/sentiment", params);
};

// here

export const searchCharacter = async (params: {
  name: string;
}): Promise<string> => {
  return seoulInstance.get("/characters", { params });
};

export const resetStatPoint = async (): Promise<{
  message: string;
  unusedStat: number;
  gold: number;
}> => {
  return seoulInstance.patch("/characters/stat/reset");
};

// chat

export const getChatResponse = async (params: {
  body: string;
}): Promise<string> => {
  return usInstance.post("/character/chat", params);
};
export const getTestResponse = async (params: {
  body: string;
}): Promise<string> => {
  return usInstance.post("character/chat/claude3", params);
};
