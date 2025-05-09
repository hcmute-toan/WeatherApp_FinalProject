// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { APP_COLOR } from "@/utils/constant";

const TabLayout = () => {
  const getIcons = (routeName: string, focused: boolean, size: number) => {
    const color = focused ? APP_COLOR.Default : APP_COLOR.GRAY;
    switch (routeName) {
      case "index":
        return <FontAwesome name="home" size={24} color={color} />;
      case "search":
        return <MaterialIcons name="search" size={size} color={color} />;
      case "location":
        return <MaterialIcons name="location-pin" size={size} color={color} />;
      case "setting":
        return <MaterialIcons name="settings" size={size} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => getIcons(route.name, focused, size),
        headerShown: false,
        tabBarLabelStyle: { paddingBottom: 3 },
        tabBarActiveTintColor: APP_COLOR.Default,
        tabBarInactiveTintColor: APP_COLOR.GRAY,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="location" options={{ title: "Location" }} />
      <Tabs.Screen name="setting" options={{ title: "Setting" }} />
    </Tabs>
  );
};

export default TabLayout;
