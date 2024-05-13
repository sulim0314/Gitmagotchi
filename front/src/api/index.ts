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

usInstance.interceptors.response.use(
  (response) => {
    const data = response.data;
    const body = JSON.parse(data.body);
    if (data.statusCode === 200) {
      return body;
    }
    return Promise.reject(body);
  },
  (error) => {
    return Promise.reject(error);
  }
);

seoulInstance.interceptors.response.use(
  (response) => {
    const data = response.data;
    const body = JSON.parse(data.body);
    if (data.statusCode === 200) {
      return body;
    }
    return Promise.reject(body);
  },
  (error) => {
    return Promise.reject(error);
  }
);
