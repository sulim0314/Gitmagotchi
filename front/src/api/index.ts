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

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const accessToken = localStorage.getItem("accessToken");

//     if (!accessToken) {
//       window.location.href = "/login";
//       return config;
//     }

//     config.headers["Authorization"] = `Bearer ${accessToken}`;

//     return config;
//   },
//   (error) => {
//     console.log(error);
//     return Promise.reject(error);
//   }
// );
