import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://t88hdayt7e.execute-api.us-east-1.amazonaws.com/api",
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
