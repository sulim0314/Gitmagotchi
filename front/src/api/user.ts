import { sampleUser } from "./sample";

export const getUser = async (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleUser);
    }, 2000);
  });
};
