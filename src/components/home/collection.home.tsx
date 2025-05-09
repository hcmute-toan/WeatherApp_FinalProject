import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { APP_COLOR } from "@/utils/constant";
import { useEffect, useState } from "react";
import { getTopRestaurant } from "@/utils/api";
import { router } from "expo-router";
import ContentLoader, { Rect, Circle, Path } from "react-content-loader/native";

const { height: sHeight, width: sWidth } = Dimensions.get("window");
interface IProps {
  name: string;
  description: string;
  refAPI: string;
}
const styles = StyleSheet.create({
  item: {
    borderColor: "green",
    borderWidth: 1,
    height: 250,
    marginBottom: 6,
    width: "100%",
    padding: 10,
  },
  discount: {
    borderRadius: 1,
    borderColor: "red",
    padding: 1,
    borderWidth: 1,
  },
  discountName: {
    color: "red",
    fontSize: 12,
  },
});
const CollectionHome = (props: IProps) => {
  const { name, description, refAPI } = props;
  const [loading, setLoading] = useState(true);

  const [restaurants, setRestaurants] = useState<ITopRestaurant[]>([]);

  const backend =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;
  //   const backend = process.env.EXPO_PUBLIC_IOS_API_URL;
  const avatarDefault = `${backend}/images/restaurant/`;
  return (
    <Pressable>
      {loading === false ? (
        <View style={styles.item}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                color: APP_COLOR.GRAY,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              {name}
            </Text>
            <Text
              style={{ color: APP_COLOR.GRAY, fontWeight: "500", fontSize: 13 }}
            >
              See All
            </Text>
          </View>
          <View>
            <Text
              style={{ fontSize: 12, color: "#999" }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
          </View>
          <FlatList
            // style={{
            //   flexDirection: "row",
            //   gap: 5,
            // }}
            data={restaurants}
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              return (
                <Pressable
                  onPress={() =>
                    router.navigate({
                      pathname: "/product/[id]",
                      params: { id: item._id },
                    })
                  }
                >
                  <View style={{ padding: 5 }}>
                    <Image
                      style={{ height: 120, width: 120 }}
                      source={{ uri: `${avatarDefault}${item.image}` }}
                    />
                    <View style={{ width: "100%" }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          fontSize: 16,
                          maxWidth: 120,
                          height: 40,
                        }}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item.name}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", gap: 5, marginTop: 5 }}
                    >
                      <View style={styles.discount}>
                        <Text style={styles.discountName}>Flash Sale</Text>
                      </View>
                      <View style={styles.discount}>
                        <Text style={styles.discountName}>Code 50k</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
          <View></View>
        </View>
      ) : (
        <ContentLoader
          speed={2}
          width={sWidth}
          height={230}
          // viewBox="0 0 700 150"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
          style={{ width: "100%" }}
        >
          <Rect x="10" y="10" rx="5" ry="5" width={150} height="200" />
          <Rect x="170" y="10" rx="5" ry="5" width={150} height="200" />
          <Rect x="330" y="10" rx="5" ry="5" width={150} height="200" />
        </ContentLoader>
      )}
    </Pressable>
  );
};

export default CollectionHome;
