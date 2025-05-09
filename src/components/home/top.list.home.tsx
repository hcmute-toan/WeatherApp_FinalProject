import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BannerHome from "./banner.home";
import { APP_FONT } from "@/utils/constant";

const data = Array(10).fill(1);

// const data1 = Array(20).fill(1);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ecf0f1",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    padding: 8,
  },
  header: {
    borderColor: "red",
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: "100%",
  },
  item: {
    borderColor: "green",
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: "100%",
  },
  list: {
    overflow: "hidden",
  },
  sticky: {
    backgroundColor: "#2555FF50",
    height: 100,
    marginBottom: 6,
    width: "100%",
  },
  topList: {
    minHeight: 100,
    marginBottom: 6,
    width: "100%",
  },
});
const data1 = [
  {
    key: 1,
    name: "Football",
    source: require("@/assets/icons/football.jpg"),
  },
  {
    key: 2,
    name: "Politics",
    source: require("@/assets/icons/politics.jpg"),
  },
  {
    key: 3,
    name: "Volleyball",
    source: require("@/assets/icons/volleyball.jpg"),
  },
  {
    key: 4,
    name: "Healthcare",
    source: require("@/assets/icons/health.jpg"),
  },
  {
    key: 5,
    name: "Economy",
    source: require("@/assets/icons/economy.jpg"),
  },
  {
    key: 6,
    name: "Culture",
    source: require("@/assets/icons/culture.jpg"),
  },
  {
    key: 7,
    name: "Education",
    source: require("@/assets/icons/education.jpg"),
  },
  {
    key: 8,
    name: "Technology",
    source: require("@/assets/icons/technology.jpg"),
  },
  {
    key: 9,
    name: "Entertain",
    source: require("@/assets/icons/entertainment.jpg"),
  },
  {
    key: 10,
    name: "Travel",
    source: require("@/assets/icons/travel.jpg"),
  },
  {
    key: 11,
    name: "Law",
    source: require("@/assets/icons/law.jpg"),
  },
  {
    key: 12,
    name: "Military",
    source: require("@/assets/icons/military.jpg"),
  },
  {
    key: 13,
    name: "Vehicles",
    source: require("@/assets/icons/car.jpg"),
  },
  {
    key: 14,
    name: "Real Estate",
    source: require("@/assets/icons/real-estate.jpg"),
  },
  {
    key: 15,
    name: "Fashion",
    source: require("@/assets/icons/fashion.jpg"),
  },
  {
    key: 16,
    name: "Cuisine",
    source: require("@/assets/icons/food.jpg"),
  },
  {
    key: 17,
    name: "Fitness",
    source: require("@/assets/icons/fitness.jpg"),
  },
  {
    key: 18,
    name: "Environment",
    source: require("@/assets/icons/environment.jpg"),
  },
  {
    key: 19,
    name: "World",
    source: require("@/assets/icons/world.jpg"),
  },
  {
    key: 20,
    name: "Science",
    source: require("@/assets/icons/science.jpg"),
  },
];
const TopListHome = () => {
  return (
    <View style={styles.topList}>
      <BannerHome />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled={true}
        alwaysBounceVertical={false}
      >
        <FlatList
          contentContainerStyle={{ alignSelf: "flex-start" }}
          numColumns={Math.ceil(data1.length / 2)}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={data1}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{
                  padding: 7,
                  width: 100,
                  alignItems: "center",
                }}
              >
                <Image
                  style={{
                    padding: 5,
                    width: 35,
                    height: 35,
                    borderRadius: 30,
                  }}
                  source={item.source}
                />
                <Text style={{ fontFamily: APP_FONT }}>{item.name}</Text>
              </View>
            );
          }}
        />
      </ScrollView>
    </View>
  );
};
export default TopListHome;
