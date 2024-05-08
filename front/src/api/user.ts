import { seoulInstance } from ".";
// import { sampleUser } from "./sample";

export const getUser = async (params: any): Promise<any> => {
  const response = await seoulInstance.get("/users/me", { params });
  console.log(response.data);
  return response.data;
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(sampleUser);
  //   }, 2000);
  // });
};
