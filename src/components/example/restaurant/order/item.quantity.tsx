import { useCurrentApp } from "@/context/app.context";
import { currencyFormatter, getUrlBaseBackend } from "@/utils/api";
import { APP_COLOR } from "@/utils/constant";
import AntDesign from "@expo/vector-icons/AntDesign";
import { da, fa } from "@faker-js/faker/.";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import ItemSingle from "./item.single";
interface IProps {
  menuItem: IMenuItem;
  restaurant: IRestaurant | null;
  isModal: boolean;
}
const ItemQuantity = (props: IProps) => {
  const { menuItem, restaurant, isModal } = props;
  const { cart, setCart } = useCurrentApp();
  const handlePressItem = (item: IMenuItem, action: "MINUS" | "PLUS") => {
    console.log(">>>> item", item);
    if (item.options.length && isModal === false) {
      router.navigate({
        pathname:
          action === "PLUS" ? "/product/create.modal" : "/product/update.modal",
        params: {
          menuItemId: menuItem._id,
        },
      });
    } else {
      if (restaurant?.data._id) {
        const total = action === "MINUS" ? -1 : 1;
        if (!cart[restaurant.data._id]) {
          //not already have restaurant => initial restaurant
          cart[restaurant.data._id] = {
            sum: 0,
            quantity: 0,
            items: {},
          };
        }
        //handle product
        cart[restaurant.data._id].sum =
          cart[restaurant.data._id].sum + total * item.basePrice;
        cart[restaurant.data._id].quantity =
          cart[restaurant.data._id].quantity + total;
        //check produce have already add to cart
        if (!cart[restaurant.data._id].items[item._id]) {
          cart[restaurant.data._id].items[item._id] = {
            data: menuItem,
            quantity: 0,
          };
        }
        const currentQuantity =
          cart[restaurant.data._id].items[item._id].quantity + total;
        cart[restaurant.data._id].items[item._id] = {
          data: menuItem,
          quantity: currentQuantity,
        };
        if (currentQuantity <= 0) {
          delete cart[restaurant.data._id].items[item._id];
        }
        setCart((prevState: any) => ({ ...prevState, ...cart })); //merge state
      }
    }
  };
  let showMinus = false;
  let quantity = 0;
  if (restaurant?.data._id) {
    const store = cart[restaurant?.data._id!];
    if (store?.items && store?.items[menuItem?._id]) {
      showMinus = true;
      quantity = store?.items[menuItem?._id].quantity;
    }
  }
  return (
    <ItemSingle
      menuItem={menuItem}
      handlePressItem={handlePressItem}
      showMinus={showMinus}
      quantity={quantity}
    />
  );
};
export default ItemQuantity;
