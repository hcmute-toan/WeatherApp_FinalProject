// app/(tabs)/index.tsx
import {
  SafeAreaView,
  Text,
  StyleSheet,
  Button,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { APP_COLOR } from "@/utils/constant";

const HomeTab = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.weatherCard}>
        <Image
          source={{ uri: "https://via.placeholder.com/100" }} // Replace with actual weather icon URL
          style={styles.weatherIcon}
        />
        <Text style={styles.temperature}>24°C</Text>
        <Text style={styles.condition}>Sunny</Text>
        <Text style={styles.location}>Tokyo, Japan</Text>
      </View>
      <Button
        title="Open Weather Popup"
        onPress={() => router.push("/(auth)/popup.weather")}
        color={APP_COLOR.Default}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  weatherCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  temperature: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#333",
  },
  condition: {
    fontSize: 20,
    color: "#666",
  },
  location: {
    fontSize: 18,
    color: "#888",
  },
});

export default HomeTab;
