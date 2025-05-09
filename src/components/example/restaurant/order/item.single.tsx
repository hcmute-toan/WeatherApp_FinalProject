import { useCurrentApp } from "@/context/app.context";
import { currencyFormatter, getUrlBaseBackend } from "@/utils/api";
import { APP_COLOR } from "@/utils/constant";
import AntDesign from "@expo/vector-icons/AntDesign";
import { da, fa } from "@faker-js/faker/.";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
interface IProps {
  menuItem: IMenuItem | null;
  handlePressItem: any;
  showMinus: boolean;
  quantity: number;
}
const ItemSingle = (props: IProps) => {
  const { menuItem, handlePressItem, showMinus, quantity } = props;
  return (
    <View
      style={{
        paddingHorizontal: 10,
        backgroundColor: "white",
        marginTop: 10,
      }}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View>
          <Image
            style={{ width: 80, height: 80 }}
            source={{
              uri: `${getUrlBaseBackend()}/images/menu-item/${menuItem?.image}`,
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            {menuItem?.title}
          </Text>
          <Text>{menuItem?.description}</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                fontSize: 16,
                color: "red",
              }}
            >
              {currencyFormatter(menuItem?.basePrice)}
            </Text>
            <View
              style={{
                gap: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {showMinus && (
                <Pressable
                  style={({ pressed }) => ({
                    opacity: pressed === true ? 0.5 : 1,
                    alignItems: "flex-start",
                  })}
                  onPress={() => handlePressItem(menuItem, "MINUS")}
                >
                  <AntDesign
                    name="minussquareo"
                    size={24}
                    color={APP_COLOR.GRAY}
                  />
                </Pressable>
              )}

              <Text>{quantity}</Text>
              <Pressable
                style={({ pressed }) => ({
                  opacity: pressed === true ? 0.5 : 1,
                  alignItems: "flex-start",
                })}
                onPress={() => handlePressItem(menuItem, "PLUS")}
              >
                <AntDesign name="plussquare" size={24} color={APP_COLOR.GRAY} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
export default ItemSingle;
