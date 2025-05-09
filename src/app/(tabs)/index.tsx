import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { APP_COLOR } from "@/utils/constant";
import CustomFlatList from "@/components/CustomFlatList/CustomFlatList";

const { width: sWidth } = Dimensions.get("window");

const HomeTab = () => {
  // Mock data for hourly forecast
  const hourlyForecast = [
    { time: "Now", temp: "66°", icon: "sunny" },
    { time: "10AM", temp: "68°", icon: "sunny" },
    { time: "11AM", temp: "74°", icon: "sunny" },
    { time: "12PM", temp: "78°", icon: "sunny" },
    { time: "1PM", temp: "81°", icon: "sunny" },
    { time: "2PM", temp: "82°", icon: "sunny" },
  ];

  // Mock data for 10-day forecast
  const dailyForecast = [
    { day: "Today", low: "55°", high: "85°", condition: "Sunny" },
    { day: "Thu", low: "55°", high: "86°", condition: "Sunny" },
    { day: "Fri", low: "56°", high: "81°", condition: "Sunny" },
    { day: "Sat", low: "52°", high: "82°", condition: "Sunny" },
  ];

  const HeaderComponent = (
    <View style={styles.headerContainer}>
      <Text style={styles.location}>Cupertino</Text>
      <Text style={styles.temperature}>66°</Text>
      <Text style={styles.condition}>Mostly Sunny</Text>
      <Text style={styles.highLow}>H:85° L:55°</Text>
      <Text style={styles.description}>
        Sunny conditions will continue all day. Wind gusts are up to 7 mph.
      </Text>
    </View>
  );

  const StickyElementComponent = (
    <View style={styles.stickyContainer}>
      <FlatList
        horizontal
        data={hourlyForecast}
        keyExtractor={(item) => item.time}
        renderItem={({ item }) => (
          <View style={styles.hourlyItem}>
            <Text style={styles.hourlyTime}>{item.time}</Text>
            <Image
              source={{ uri: "https://via.placeholder.com/30" }} // Replace with actual weather icon URL
              style={styles.hourlyIcon}
            />
            <Text style={styles.hourlyTemp}>{item.temp}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  const TopListElementComponent = <View style={styles.topListPlaceholder} />;

  return (
    <SafeAreaView style={styles.container}>
      <CustomFlatList
        data={dailyForecast}
        HeaderComponent={HeaderComponent}
        StickyElementComponent={StickyElementComponent}
        TopListElementComponent={TopListElementComponent}
        renderItem={({ item }) => (
          <View style={styles.dailyItem}>
            <Text style={styles.dailyDay}>{item.day}</Text>
            <Image
              source={{ uri: "https://via.placeholder.com/30" }} // Replace with actual weather icon URL
              style={styles.dailyIcon}
            />
            <Text style={styles.dailyLow}>{item.low}</Text>
            <View style={styles.tempBar}>
              <View
                style={[
                  styles.tempBarFill,
                  {
                    width:
                      ((parseInt(item.high) - parseInt(item.low)) / 40) * 100,
                  },
                ]}
              />
            </View>
            <Text style={styles.dailyHigh}>{item.high}</Text>
          </View>
        )}
        keyExtractor={(item) => item.day}
        ListHeaderComponentStyle={styles.listHeader}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB", // Sky blue background
  },
  headerContainer: {
    alignItems: "center",
    padding: 20,
  },
  location: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  temperature: {
    fontSize: 80,
    fontWeight: "300",
    color: "#fff",
    marginVertical: 10,
  },
  condition: {
    fontSize: 20,
    color: "#fff",
  },
  highLow: {
    fontSize: 16,
    color: "#fff",
    marginVertical: 5,
  },
  description: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
  },
  stickyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  hourlyItem: {
    alignItems: "center",
    paddingHorizontal: 15,
  },
  hourlyTime: {
    fontSize: 14,
    color: "#333",
  },
  hourlyIcon: {
    width: 30,
    height: 30,
    marginVertical: 5,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  topListPlaceholder: {
    height: 10, // Adjust as needed for spacing
  },
  listHeader: {
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  dailyDay: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  dailyIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 10,
  },
  dailyLow: {
    fontSize: 16,
    color: "#666",
    marginRight: 10,
  },
  tempBar: {
    width: 100,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
    marginHorizontal: 10,
  },
  tempBarFill: {
    height: "100%",
    backgroundColor: "#FFA500", // Orange for temperature range
  },
  dailyHigh: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default HomeTab;
