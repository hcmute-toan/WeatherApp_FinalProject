import { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentWeather } from "../../services/weather";
import { router, useFocusEffect } from "expo-router";

const PlaceholderIcon = ({
  style,
  code,
}: {
  style?: object;
  code?: number;
}) => (
  <View
    style={[
      {
        width: 30,
        height: 30,
        backgroundColor: "#ccc",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
      },
      style,
    ]}
  >
    <Text style={{ color: "#fff" }}>☁</Text>
  </View>
);

const LocationPage = () => {
  const [favorites, setFavorites] = useState<
    {
      city: string;
      latitude: number;
      longitude: number;
      weather?: { temp: number; description: string; code?: number };
      isDefault: boolean;
    }[]
  >([]);
  const [settings, setSettings] = useState<{
    tempUnit: "C" | "F";
    windUnit: "kmh" | "mph";
  }>({ tempUnit: "C", windUnit: "kmh" });

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem("favorites");
      const savedSettings = await AsyncStorage.getItem("settings");
      const parsedSettings = savedSettings
        ? JSON.parse(savedSettings)
        : { tempUnit: "C", windUnit: "kmh" };
      setSettings(parsedSettings);

      if (savedFavorites) {
        const favoriteList = JSON.parse(savedFavorites);
        const updatedFavorites = await Promise.all(
          favoriteList.map(
            async (fav: {
              city: string;
              latitude: number;
              longitude: number;
              isDefault: boolean;
            }) => {
              try {
                const weather = await getCurrentWeather({
                  latitude: fav.latitude,
                  longitude: fav.longitude,
                });
                return {
                  ...fav,
                  weather: {
                    temp: convertTemperature(
                      weather.hourly.temperature_2m[0],
                      parsedSettings.tempUnit
                    ),
                    description: weatherCodeToText(
                      weather.hourly.weather_code?.[0]
                    ),
                    code: weather.hourly.weather_code?.[0],
                  },
                };
              } catch (err) {
                console.error(`Lỗi khi lấy thời tiết cho ${fav.city}:`, err);
                return { ...fav, weather: undefined };
              }
            }
          )
        );
        setFavorites(updatedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích:", error);
      setFavorites([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const weatherCodeToText = (code?: number): string => {
    if (!code) return "Không xác định";
    const weatherCodes: { [key: number]: string } = {
      0: "Trời quang",
      1: "Gần như quang đãng",
      2: "Có mây rải rác",
      3: "Nhiều mây",
      45: "Sương mù",
      48: "Sương mù có băng giá",
      51: "Mưa phùn nhẹ",
      53: "Mưa phùn vừa",
      55: "Mưa phùn dày",
      61: "Mưa nhẹ",
      63: "Mưa vừa",
      65: "Mưa to",
      80: "Mưa rào nhẹ",
      81: "Mưa rào vừa",
      82: "Mưa rào mạnh",
      95: "Dông bão",
      96: "Dông bão kèm mưa đá nhẹ",
      99: "Dông bão kèm mưa đá lớn",
    };
    return weatherCodes[code] || "Không xác định";
  };

  const convertTemperature = (temp: number, unit: "C" | "F") => {
    if (typeof temp !== "number" || isNaN(temp)) return 0;
    return unit === "F" ? (temp * 9) / 5 + 32 : temp;
  };

  const handleRemoveFavorite = async (index: number) => {
    const removedFav = favorites[index];
    if (removedFav.isDefault) {
      // Prevent removal of default location
      return;
    }
    const newFavorites = favorites.filter((_, i) => i !== index);
    setFavorites(newFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const handleSetDefault = async (index: number) => {
    const newFavorites = favorites.map((fav, i) => ({
      ...fav,
      isDefault: i === index,
    }));
    setFavorites(newFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));

    // Save the default location
    const defaultLocation = {
      city: newFavorites[index].city,
      latitude: newFavorites[index].latitude,
      longitude: newFavorites[index].longitude,
    };
    await AsyncStorage.setItem(
      "defaultLocation",
      JSON.stringify(defaultLocation)
    );
  };

  const handleSelectLocation = (location: {
    city: string;
    latitude: number;
    longitude: number;
  }) => {
    router.push({
      pathname: "/(tabs)",
      params: {
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        city: location.city,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa điểm</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) =>
          `${item.latitude}-${item.longitude}-${index}`
        }
        renderItem={({ item, index }) => (
          <View style={styles.locationItem}>
            <TouchableOpacity
              style={styles.locationInfo}
              onPress={() => handleSelectLocation(item)}
            >
              <Text style={styles.cityName}>
                {item.city} {item.isDefault ? "(Mặc định)" : ""}
              </Text>
              <Text style={styles.weatherInfo}>
                {item.weather
                  ? `${item.weather.temp.toFixed(1)}°${settings.tempUnit}, ${
                      item.weather.description
                    }`
                  : "Không có dữ liệu thời tiết"}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.defaultButton,
                  item.isDefault && styles.defaultButtonActive,
                ]}
                onPress={() => handleSetDefault(index)}
              >
                <Text style={styles.defaultButtonText}>
                  {item.isDefault ? "Mặc định" : "Đặt mặc định"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRemoveFavorite(index)}
                disabled={item.isDefault}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={item.isDefault ? "#888" : "#FF3B30"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có địa điểm yêu thích</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F2A44",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  locationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  locationInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  weatherInfo: {
    fontSize: 14,
    color: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  defaultButtonActive: {
    backgroundColor: "#4CAF50",
  },
  defaultButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
});

export default LocationPage;
