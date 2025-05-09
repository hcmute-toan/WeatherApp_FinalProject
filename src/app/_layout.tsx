import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.hideAsync();
        router.replace("/(auth)/popup.weather"); // Navigate to popup on app start
      } catch (e) {
        console.warn("Error navigating to popup:", e);
        router.replace("/(tabs)"); // Fallback to tabs if popup fails
      }
    }

    prepare();
  }, [router]);

  return <Slot />; // Render Slot to initialize the router
};

export default RootLayout;
