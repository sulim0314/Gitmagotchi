import axios from "axios";

export const usInstance = axios.create({
  baseURL: "https://t88hdayt7e.execute-api.us-east-1.amazonaws.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const seoulInstance = axios.create({
  baseURL: "https://xvspz2kap6.execute-api.ap-northeast-2.amazonaws.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

usInstance.interceptors.request.use(
  (config) => {
    const recoilValue = localStorage.getItem("recoil-persist");

    if (recoilValue) {
      const recoilJson = JSON.parse(recoilValue);
      const accessToken = recoilJson.authData.attributes.sub;
      const userId = recoilJson.userData.userId;
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      config.headers["userId"] = userId;
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

seoulInstance.interceptors.request.use(
  (config) => {
    const recoilValue = localStorage.getItem("recoil-persist");

    if (recoilValue) {
      const recoilJson = JSON.parse(recoilValue);
      const accessToken = recoilJson.authData.attributes.sub;
      const userId = recoilJson.userData.userId;
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      config.headers["userId"] = userId;
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);
