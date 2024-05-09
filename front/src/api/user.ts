import { seoulInstance } from ".";
// import { sampleUser } from "./sample";

export const getUser = async (params: any): Promise<any> => {
  const response = await seoulInstance.get("/users/me", { params });
  return response.data;
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(sampleUser);
  //   }, 2000);
  // });
};
