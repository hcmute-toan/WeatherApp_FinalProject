import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import popupImg from "@/assets/weatherPopUp.jpg"; // Ensure this image exists in your assets

const PopupWeatherPage = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onTouchEnd={() => router.replace("/(tabs)")} // Navigate to tabs root
      >
        <Animated.View
          entering={SlideInDown.duration(500).springify()}
          style={{
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            backgroundColor: "transparent",
          }}
        >
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")} // Navigate to tabs root
            style={{
              backgroundColor: "white",
              height: 26,
              width: 26,
              borderRadius: 13,
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: -20,
              right: -20,
            }}
          >
            <AntDesign name="close" size={22} color="grey" />
          </TouchableOpacity>
          <Image
            source={popupImg}
            style={{
              height: 400,
              width: 350,
            }}
          />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default PopupWeatherPage;
