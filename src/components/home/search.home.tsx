import { Pressable, StyleSheet, Text, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
const styles = StyleSheet.create({
  search: {
    backgroundColor: "#ccc",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
    paddingHorizontal: 5,
    marginBottom: 5,
    paddingVertical: 10,
    gap: 7,
  },
});
const SearchHome = () => {
  return (
    <View>
      <Pressable
        style={styles.search}
        onPress={() => {
          router.navigate("/(auth)/search");
        }}
      >
        <AntDesign name="search1" size={15} color="black" />

        <Text>Search News Now</Text>
      </Pressable>
    </View>
  );
};

export default SearchHome;
