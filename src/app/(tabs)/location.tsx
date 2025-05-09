// app/(tabs)/location.tsx
import { SafeAreaView, Text, StyleSheet, View, Image } from "react-native";
import { APP_COLOR } from "@/utils/constant";

const LocationTab = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.weatherCard}>
        <Image
          source={{ uri: "https://via.placeholder.com/100" }} // Replace with actual weather icon URL
          style={styles.weatherIcon}
        />
        <Text style={styles.location}>Current Location: Tokyo</Text>
        <Text style={styles.temperature}>22°C</Text>
        <Text style={styles.condition}>Sunny</Text>
      </View>
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
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  location: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
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
});

export default LocationTab;
