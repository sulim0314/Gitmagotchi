import { seoulInstance } from ".";

export const getSearchList = async (params: any): Promise<any> => {
  const response = await seoulInstance.post("/collection", params);
  return response.data;
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     if (params.type === "CHARACTER") {
  //       resolve(sampleCharacterList);
  //     } else {
  //       resolve(sampleUserList);
  //     }
  //   }, 2000);
  // });
};

export const getUserSearchList = async (params: any): Promise<any> => {
  return seoulInstance.get("/users/search", { params });
};

export const getCharacterSearchList = async (params: any): Promise<any> => {
  return seoulInstance.get("/characters/search", { params });
};
