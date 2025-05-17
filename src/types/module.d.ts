// // data type

// export {};
// declare global {
//   interface IBackendRes<T> {
//     error?: string | string[];
//     message?: string | string[];
//     statusCode?: number | string;
//     data: T;
//   }

//   interface IRegister {
//     _id: string;
//   }
//   interface IUserLogin {
//     data: {
//       user: {
//         email: string;
//         _id: string;
//         name: string;
//         role?: string;
//         address?: any;
//         avatar: string;
//         phone?: string;
//       };
//       access_token: string;
//     };
//   }
//   interface IUpdateUser {
//     email: string;
//     _id: string;
//     name: string;
//     phone: string;
//   }
//   interface ITopRestaurant {
//     _id: string;
//     name: string;
//     phone: string;
//     address: string;
//     email: string;
//     rating: number;
//     image: string;
//     isActive: boolean;
//     createdAt: Date;
//     updatedAt: Date;
//   }
//   interface IMenu {
//     _id: string;
//     restaurant: string;
//     title: string;
//     createdAt: Date;
//     updatedAt: Date;
//     menuItem: IMenuItem[];
//     image;
//   }
//   interface IMenuItem {
//     _id: string;
//     menu: string;
//     title: string;
//     description: string;
//     basePrice: number;
//     image: string;
//     options: {
//       title: string;
//       description: string;
//       additionalPrice: number;
//     }[];
//     createdAt: Date;
//     updatedAt: Date;
//   }
//   interface IRestaurant {
//     data: {
//       _id: string;
//       name: string;
//       phone: string;
//       address: string;
//       email: string;
//       rating: number;
//       image: string;
//       isActive: boolean;
//       createdAt: Date;
//       updatedAt: Date;
//       menu: IMenu[];
//       isLike: boolean;
//     };
//   }
//   interface ICart {
//     [key: string]: {
//       sum: number;
//       quantity: number;
//       items: {
//         [key: string]: {
//           quantity: number;
//           data: IMenuItem;
//           extra?: {
//             [key: string]: number;
//           };
//         };
//       };
//     };
//   }
//   interface IOrderHistory {
//     _id: string;
//     restaurant: IRestaurant; // API returns a string (restaurant ID)
//     totalPrice: number;
//     totalQuantity: number;
//     detail: {
//       _id: string;
//       image: string;
//       title: string;
//       option: string;
//       price: number;
//       quantity: number;
//       isDeleted: boolean;
//       deletedAt: string | null;
//     }[];
//     createdAt: string; // API returns ISO date string
//     updatedAt: string; // API returns ISO date string
//     isDeleted: boolean;
//     deletedAt: string | null;
//     __v: number;
//   }
//   interface IForgotPassword {
//     code: string;
//     newPassword: string;
//     confirmNewPassword: string;
//     email: string;
//   }
//   interface ILike {
//     _id: string;
//     restaurant: {
//       _id: string;
//       name: string;
//       image: string;
//     };
//     user: string;
//     quantity: number;
//     createdAt: string;
//     updatedAt: string;
//   }
//   interface IModelPaginate<T> {
//     meta: {
//       current: number;
//       pageSize: number;
//       pages: number;
//       total: number;
//     };
//     result: T[];
//   }
// }
