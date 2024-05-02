import { axiosInstance } from ".";

export const getChatResponse = async (params: any): Promise<any> => {
  const response = await axiosInstance.post("/character/chat", params);
  return response.data;
};
