import { Text, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
const HeaderHome = () => {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          gap: 3,
          alignItems: "center",
          marginTop: 5,
        }}
      >
        <Entypo name="location-pin" size={24} color="red" />
        <Text>1 Vo Van Ngan, Linh Chieu Ward, Thu Duc City</Text>
      </View>
    </View>
  );
};

export default HeaderHome;
