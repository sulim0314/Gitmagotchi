import { usInstance } from ".";

export const generateBackground = async (params: {
  body: string;
}): Promise<{ imageUrl: string }> => {
  return usInstance.post("/background/ai", params);
};

export const uploadBackground = async (params: { body: string }): Promise<{ imageUrl: string }> => {
  return usInstance.post("/background/upload", params);
};
