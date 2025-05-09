import { Button, Text, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { APP_COLOR } from "@/utils/constant";
import { currencyFormatter } from "@/utils/api";
import { useCurrentApp } from "@/context/app.context";
import { router } from "expo-router";
interface IProps {
  restaurant: IRestaurant | null;
}
const StickyFooter = (props: IProps) => {
  const { cart, setCart } = useCurrentApp();
  const { restaurant } = props;
  const getSum = () => {
    if (restaurant && cart[restaurant.data._id]) {
      return cart[restaurant.data._id].sum;
    }
    return 0;
  };

  return (
    <>
      {getSum() === 0 ? (
        <></>
      ) : (
        <View
          style={{
            width: "100%",
            backgroundColor: "white",
            zIndex: 11,
            position: "absolute",
            bottom: 0,
            flexDirection: "row",
            gap: 10,
            padding: 10,
            borderTopWidth: 2,
            borderTopColor: "#ccc",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 30,
              alignItems: "center",
            }}
          >
            <View style={{ position: "relative" }}>
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  position: "absolute",
                  top: -13,
                  right: -11,
                  padding: 3,
                  backgroundColor: APP_COLOR.GRAY,
                  borderRadius: 30,
                }}
              >
                {restaurant &&
                  cart[restaurant?.data._id] &&
                  cart[restaurant?.data._id]["quantity"] && (
                    <Text>{cart[restaurant?.data._id]["quantity"]}</Text>
                  )}
              </Text>
              <AntDesign name="shoppingcart" size={30} color={APP_COLOR.GRAY} />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  color: APP_COLOR.GRAY,
                  fontWeight: "600",
                }}
              >
                <Text>{currencyFormatter(getSum())}</Text>
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: APP_COLOR.GRAY,
              width: 100,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
              padding: 10,
            }}
          >
            <Text
              onPress={() => {
                router.navigate("/product/order");
              }}
              style={{ color: "#fff" }}
            >
              Delivery
            </Text>
          </View>
        </View>
      )}
    </>
  );
};
export default StickyFooter;
