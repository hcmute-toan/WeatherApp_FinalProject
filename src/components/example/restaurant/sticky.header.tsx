// import { APP_COLOR } from "@/utils/constant";
// import { router } from "expo-router";
// import {
//   Dimensions,
//   Pressable,
//   StyleSheet,
//   TextInput,
//   View,
// } from "react-native";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import Animated from "react-native-reanimated";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useState } from "react";
// import Toast from "react-native-root-toast";
// import { likedRestaurant } from "@/utils/api";

// const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);
// const { height: sHeight, width: sWidth } = Dimensions.get("window");

// interface IProps {
//   headerHeight: number;
//   imageHeight: number;
//   animatedBackgroundStyle: any;
//   animatedArrowColorStyle: any;
//   animatedStickyHeaderStyle: any;
//   animatedHeartIconStyle: any;
//   restaurantId: any;
// }

// const StickyHeader = (props: IProps) => {
//   const insets = useSafeAreaInsets();
//   const {
//     restaurantId,
//     headerHeight,
//     imageHeight,
//     animatedBackgroundStyle,
//     animatedArrowColorStyle,
//     animatedStickyHeaderStyle,
//     animatedHeartIconStyle,
//   } = props;
//   const [isLiked, setIsLiked] = useState<boolean>(false);
//   const [isDisliked, setIsDisliked] = useState<boolean>(false);

//   const handleLike = async () => {
//     try {
//       // Toggle between like (1) and dislike (-1)
//       const newQuantity = isLiked ? -1 : 1;
//       const res = await likedRestaurant(restaurantId, newQuantity);
//       if (res.data) {
//         const newIsLiked = newQuantity === 1;
//         const newIsDisliked = newQuantity === -1;
//         setIsLiked(newIsLiked);
//         setIsDisliked(newIsDisliked);
//         Toast.show(newIsLiked ? "Restaurant liked!" : "Restaurant disliked!", {
//           duration: Toast.durations.LONG,
//           textColor: "white",
//           backgroundColor: newIsLiked
//             ? APP_COLOR.GRAY || "green"
//             : APP_COLOR.BLUE || "blue",
//           opacity: 1,
//         });
//       }
//     } catch (error: any) {
//       const msg =
//         error.message ||
//         `Failed to ${
//           isLiked ? "dislike" : "like"
//         } restaurant. Please try again.`;
//       Toast.show(msg, {
//         duration: Toast.durations.LONG,
//         textColor: "white",
//         backgroundColor: APP_COLOR.GRAY || "GRAY",
//         opacity: 1,
//       });
//     }
//   };

//   return (
//     <>
//       <View
//         style={{
//           zIndex: 11,
//           paddingTop: insets.top + 10,
//           paddingHorizontal: 10,
//           flexDirection: "row",
//           gap: 5,
//           height: headerHeight,
//           position: "absolute",
//           width: sWidth,
//         }}
//       >
//         <Pressable
//           style={({ pressed }) => [
//             { opacity: pressed ? 0.5 : 1 },
//             { alignSelf: "flex-start" },
//           ]}
//           onPress={() => router.back()}
//         >
//           <Animated.View
//             style={[
//               animatedBackgroundStyle,
//               {
//                 height: 30,
//                 width: 30,
//                 borderRadius: 30 / 2,
//                 justifyContent: "center",
//                 alignItems: "center",
//               },
//             ]}
//           >
//             <AnimatedMaterialIcons
//               name="arrow-back"
//               size={24}
//               style={animatedArrowColorStyle}
//             />
//           </Animated.View>
//         </Pressable>
//         <Animated.View style={[{ flex: 1 }, animatedStickyHeaderStyle]}>
//           <TextInput
//             placeholder={"Tìm món ăn tại cửa hàng..."}
//             style={{
//               borderWidth: 1,
//               borderColor: APP_COLOR.GREY,
//               width: "100%",
//               borderRadius: 3,
//               paddingHorizontal: 10,
//             }}
//           />
//         </Animated.View>
//       </View>
//       {/* background */}
//       <Animated.View
//         style={[
//           {
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             zIndex: 10,
//             height: headerHeight,
//             backgroundColor: "white",
//           },
//           animatedStickyHeaderStyle,
//         ]}
//       />
//       {/* like/dislike a restaurant */}
//       <Animated.View
//         style={[
//           {
//             position: "absolute",
//             top: imageHeight + 80,
//             right: 10,
//             zIndex: 9,
//           },
//           animatedHeartIconStyle,
//         ]}
//       >
//         <MaterialIcons
//           onPress={handleLike}
//           name={
//             isLiked
//               ? "favorite"
//               : isDisliked
//               ? "thumb-down"
//               : "favorite-outline"
//           }
//           size={20}
//           color={
//             isLiked
//               ? APP_COLOR.GRAY || "red"
//               : isDisliked
//               ? APP_COLOR.BLUE || "blue"
//               : APP_COLOR.GREY || "grey"
//           }
//         />
//       </Animated.View>
//     </>
//   );
// };

// export default StickyHeader;

import { APP_COLOR } from "@/utils/constant";
import { router } from "expo-router";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Toast from "react-native-root-toast";
import { likedRestaurant, getRestaurantLikeStatus } from "@/utils/api";

const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);
const { height: sHeight, width: sWidth } = Dimensions.get("window");

interface IProps {
  headerHeight: number;
  imageHeight: number;
  animatedBackgroundStyle: any;
  animatedArrowColorStyle: any;
  animatedStickyHeaderStyle: any;
  animatedHeartIconStyle: any;
  restaurantId: any;
}

const StickyHeader = (props: IProps) => {
  const insets = useSafeAreaInsets();
  const {
    restaurantId,
    headerHeight,
    imageHeight,
    animatedBackgroundStyle,
    animatedArrowColorStyle,
    animatedStickyHeaderStyle,
    animatedHeartIconStyle,
  } = props;
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isDisliked, setIsDisliked] = useState<boolean>(false);

  // Fetch initial like status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await getRestaurantLikeStatus(restaurantId);
        const like = res.data.data.result[0];
        if (like) {
          setIsLiked(like.quantity === 1);
          setIsDisliked(like.quantity === -1);
        } else {
          setIsLiked(false);
          setIsDisliked(false);
        }
      } catch (error: any) {
        console.error("Failed to fetch like status:", error.message);
      }
    };
    fetchLikeStatus();
  }, [restaurantId]);

  const handleLike = async () => {
    try {
      // Toggle between like (1) and dislike (-1)
      const newQuantity = isLiked ? -1 : 1;
      const res = await likedRestaurant(restaurantId, newQuantity);
      if (res.data.data) {
        const newIsLiked = newQuantity === 1;
        const newIsDisliked = newQuantity === -1;
        setIsLiked(newIsLiked);
        setIsDisliked(newIsDisliked);
        Toast.show(newIsLiked ? "Restaurant liked!" : "Restaurant disliked!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: newIsLiked
            ? APP_COLOR.GRAY || "green"
            : APP_COLOR.BLUE || "blue",
          opacity: 1,
        });
      }
    } catch (error: any) {
      const msg =
        error.message ||
        `Failed to ${
          isLiked ? "dislike" : "like"
        } restaurant. Please try again.`;
      Toast.show(msg, {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.GRAY || "GRAY",
        opacity: 1,
      });
    }
  };

  return (
    <>
      <View
        style={{
          zIndex: 11,
          paddingTop: insets.top + 10,
          paddingHorizontal: 10,
          flexDirection: "row",
          gap: 5,
          height: headerHeight,
          position: "absolute",
          width: sWidth,
        }}
      >
        <Pressable
          style={({ pressed }) => [
            { opacity: pressed ? 0.5 : 1 },
            { alignSelf: "flex-start" },
          ]}
          onPress={() => router.back()}
        >
          <Animated.View
            style={[
              animatedBackgroundStyle,
              {
                height: 30,
                width: 30,
                borderRadius: 30 / 2,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <AnimatedMaterialIcons
              name="arrow-back"
              size={24}
              style={animatedArrowColorStyle}
            />
          </Animated.View>
        </Pressable>
        <Animated.View style={[{ flex: 1 }, animatedStickyHeaderStyle]}>
          <TextInput
            placeholder={"Tìm món ăn tại cửa hàng..."}
            style={{
              borderWidth: 1,
              borderColor: APP_COLOR.GREY,
              width: "100%",
              borderRadius: 3,
              paddingHorizontal: 10,
            }}
          />
        </Animated.View>
      </View>
      {/* background */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            height: headerHeight,
            backgroundColor: "white",
          },
          animatedStickyHeaderStyle,
        ]}
      />
      {/* like/dislike a restaurant */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: imageHeight + 80,
            right: 10,
            zIndex: 9,
          },
          animatedHeartIconStyle,
        ]}
      >
        <MaterialIcons
          onPress={handleLike}
          name={
            isLiked
              ? "favorite"
              : isDisliked
              ? "thumb-down"
              : "favorite-outline"
          }
          size={20}
          color={
            isLiked
              ? APP_COLOR.GRAY || "red"
              : isDisliked
              ? APP_COLOR.BLUE || "blue"
              : APP_COLOR.GREY || "grey"
          }
        />
      </Animated.View>
    </>
  );
};

export default StickyHeader;
