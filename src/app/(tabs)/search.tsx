import {
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  View,
  Image,
} from "react-native";
import { useState } from "react";
import { APP_COLOR } from "@/utils/constant";
import { LinearGradient } from "expo-linear-gradient";

const SearchTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const locations = [
    { id: "1", name: "Tokyo", temp: "22°C", condition: "Sunny" },
    { id: "2", name: "Osaka", temp: "20°C", condition: "Cloudy" },
    { id: "3", name: "Kyoto", temp: "21°C", condition: "Rainy" },
    { id: "4", name: "Sapporo", temp: "18°C", condition: "Snowy" },
    { id: "5", name: "Fukuoka", temp: "23°C", condition: "Partly Cloudy" },
  ];

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        style={styles.gradient}
        colors={["#87CEEB", "#E0F6FF"]}
        locations={[0, 0.8]}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Search city..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.locationItem}>
              <Image
                source={{ uri: "https://via.placeholder.com/50" }} // Replace with actual weather icon URL
                style={styles.itemIcon}
              />
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                  {item.temp}, {item.condition}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No results found</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 15,
    elevation: 2,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  itemDetails: {
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default SearchTab;
