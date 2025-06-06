// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { Platform } from "react-native";
// const backend =
//   Platform.OS === "android"
//     ? process.env.EXPO_PUBLIC_ANDROID_API_URL
//     : process.env.EXPO_PUBLIC_IOS_API_URL;
// console.log(">>> check backend ", backend);
// const instance = axios.create({
//   baseURL: backend,
//   timeout: 5 * 1000, //10s
// });
// instance.interceptors.request.use(
//   async function (config) {
//     // Do something before request is sent
//     // config.header["delay"] = 5000
//     const access_token = await AsyncStorage.getItem("access_token");
//     console.log("⚠️ access_token:", access_token); // 👈 In ra token
//     config.headers["Authorization"] = `Bearer ${access_token}`;
//     return config;
//   },
//   function (error) {
//     debugger;
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );

// // Add a response interceptor
// axios.interceptors.response.use(
//   function (response) {
//     // Any status code that lie within the range of 2xx cause this function to trigger
//     // Do something with response data
//     if (response.data) return response.data;
//     return response;
//   },
//   function (error) {
//     if (error?.response?.data) return error?.response?.data;
//     // Any status codes that falls outside the range of 2xx cause this function to trigger
//     // Do something with response error
//     return Promise.reject(error);
//   }
// );
// export default instance;
