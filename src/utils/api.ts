// import ItemQuantity from "@/components/example/restaurant/order/item.quantity";
// import axios from "@/utils/axios.customize";
// import { da } from "@faker-js/faker/.";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Platform } from "react-native";
// export const registerAPI = (name: string, email: string, password: string) => {
//   const url = `/api/v1/auth/register`;
//   return axios.post<IBackendRes<IRegister>>(url, { name, email, password });
// };
// export const verifyCodeAPI = (email: string, code: string) => {
//   const url = `/api/v1/auth/verify-code`;
//   return axios.post<IBackendRes<IRegister>>(url, { email, code });
// };
// export const resendCodeAPI = (email: string) => {
//   console.log("email >>>>", email);
//   const url = `/api/v1/auth/verify-email`;
//   return axios.post<IBackendRes<IRegister>>(url, { email });
// };
// export const loginAPI = (username: string, password: string) => {
//   const url = `/api/v1/auth/login`;
//   return axios.post<IBackendRes<IUserLogin>>(url, { username, password });
// };
// export const getAccountAPI = () => {
//   const url = `/api/v1/auth/account`;
//   return axios.get<IBackendRes<IUserLogin>>(url);
// };
// export const getTopRestaurant = (ref: string) => {
//   const url = `/api/v1/restaurants/${ref}`;
//   return axios.post<IBackendRes<ITopRestaurant[]>>(url);
// };
// export const getRestaurantById = (id: string) => {
//   const url = `/api/v1/restaurants/${id}`;
//   return axios.get<IBackendRes<IRestaurant>>(url);
// };

// export const placeOrderAPI = (data: any) => {
//   const url = `/api/v1/orders`;
//   return axios.post<IBackendRes<IOrderHistory>>(url, { ...data });
// };
// export const getOrderHistoryAPI = (data: any) => {
//   const url = `/api/v1/orders`;
//   return axios.get<IBackendRes<IOrderHistory[]>>(url);
// };
// export const updateUserAPI = (_id: string, name: string, phone: string) => {
//   const url = `/api/v1/users`;
//   return axios.patch<IBackendRes<IUserLogin>>(url, { _id, name, phone });
// };

// export const updatePassword = (
//   currentPassword: string,
//   newPassword: string
// ) => {
//   const url = `/api/v1/users/password`;
//   return axios.post<IBackendRes<IUserLogin>>(url, {
//     currentPassword,
//     newPassword,
//   });
// };

// interface ILike {
//   _id: string;
//   restaurant?: IRestaurant;
//   user?: string; // Optional for user-specific likes
//   quantity: number;
//   createdAt: string;
//   updatedAt: string;
// }

// export const likedRestaurant = (restaurant: string, quantity: number) => {
//   const url = `/api/v1/likes`;
//   return axios
//     .post<IBackendRes<ILike>>(url, {
//       restaurant,
//       quantity,
//     })
//     .catch((error) => {
//       throw new Error(
//         error.response?.data?.message ||
//           `Failed to ${quantity === 1 ? "like" : "dislike"} restaurant`
//       );
//     });
// };
// export const getRestaurantLikeStatus = (restaurant: string) => {
//   const url = `/api/v1/likes`;
//   return axios.get<IBackendRes<ILike[]>>(url, {
//     params: {
//       restaurant,
//     },
//   });
// };
// export const getUserLikes = (
//   currentPage: number = 1,
//   pageSize: number = 10
// ) => {
//   const url = `/api/v1/likes`;
//   console.log(currentPage);
//   console.log(pageSize);
//   return axios
//     .get<{
//       meta: {
//         current: number;
//         pageSize: number;
//         pages: number;
//         total: number;
//       };
//       result: ILike[];
//     }>(url, {
//       params: {
//         current: currentPage,
//         pageSize,
//       },
//     })
//     .catch((error) => {
//       throw new Error(
//         error.response?.data?.message || "Failed to fetch user likes"
//       );
//     });
// };
// export const getRestaurantByName = (name: string) => {
//   const url = `/api/v1/restaurants?current=1&pageSize=10&name=/${name}/i`;
//   return axios.get<IBackendRes<IModelPaginate<IRestaurant>>>(url);
// };
// export const forgotPassword = (
//   code: string,
//   email: string,
//   password: string
// ) => {
//   const url = `/api/v1/auth/forgot-password`;
//   return axios.post<IBackendRes<IForgotPassword>>(url, {
//     code,
//     email,
//     password,
//   });
// };
// export const getUrlBaseBackend = () => {
//   const backend =
//     Platform.OS === "android"
//       ? process.env.EXPO_PUBLIC_ANDROID_API_URL
//       : process.env.EXPO_PUBLIC_IOS_API_URL;
//   return backend;
// };
// export const printAsyncStorage = () => {
//   AsyncStorage.getAllKeys((err, keys) => {
//     AsyncStorage.multiGet(keys!, (error, stores) => {
//       let asyncStorage: any = {};
//       stores?.map((result, i, store) => {
//         asyncStorage[store[i][0]] = store[i][1];
//       });
//       console.log(JSON.stringify(asyncStorage, null, 2));
//     });
//   });
// };
// export const processDataRestaurantMenu = (restaurant: IRestaurant | null) => {
//   if (!restaurant) return [];
//   return restaurant.data?.menu?.map((menu, index) => {
//     return {
//       index,
//       key: menu._id,
//       title: menu.title,
//       data: menu.menuItem,
//     };
//   });
// };
// export const currencyFormatter = (value: any) => {
//   const options = {
//     significantDigits: 2,
//     thousandsSeparator: ".",
//     decimalSeparator: ",",
//     symbol: "d",
//   };
//   if (typeof value !== "number") value = 0.0;
//   value = value.toFixed(options.significantDigits);
//   const [currency, decimal] = value.split(".");
//   return `${currency.replace(
//     /\B(?=(\d{3})+(?!\d))/g,
//     options.thousandsSeparator
//   )}${options.symbol}`;
// };
