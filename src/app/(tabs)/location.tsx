import { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentWeather } from '../../services/weather';
import { router } from 'expo-router';

const PlaceholderIcon = ({ style }: { style?: object }) => (
  <View style={[{ width: 30, height: 30, backgroundColor: '#ccc', borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, style]}>
    <Text style={{ color: '#fff' }}>☁</Text>
  </View>
);

const LocationPage = () => {
  const [favorites, setFavorites] = useState<{ city: string; latitude: number; longitude: number; weather?: { temp: number; description: string } }[]>([]);
  const [settings, setSettings] = useState<{ tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph' }>({ tempUnit: 'C', windUnit: 'kmh' });

  useEffect(() => {
    (async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        if (savedFavorites) {
          const favoriteList = JSON.parse(savedFavorites);
          const updatedFavorites = await Promise.all(
            favoriteList.map(async (fav: { city: string; latitude: number; longitude: number }) => {
              const weather = await getCurrentWeather({ latitude: fav.latitude, longitude: fav.longitude });
              return {
                ...fav,
                weather: {
                  temp: weather.hourly.temperature_2m[0],
                  description: weatherCodeToText(weather.hourly.weather_code?.[0]),
                },
              };
            })
          );
          setFavorites(updatedFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    })();
  }, []);

  const weatherCodeToText = (code?: number): string => {
    if (!code) return 'Không xác định';
    const weatherCodes: { [key: number]: string } = {
      0: 'Trời quang', 1: 'Gần như quang đãng', 2: 'Có mây rải rác', 3: 'Nhiều mây',
      45: 'Sương mù', 48: 'Sương mù có băng giá', 51: 'Mưa phùn nhẹ', 53: 'Mưa phùn vừa',
      55: 'Mưa phùn dày', 61: 'Mưa nhẹ', 63: 'Mưa vừa', 65: 'Mưa to',
      80: 'Mưa rào nhẹ', 81: 'Mưa rào vừa', 82: 'Mưa rào mạnh',
      95: 'Dông bão', 96: 'Dông bão kèm mưa đá nhẹ', 99: 'Dông bão kèm mưa đá lớn',
    };
    return weatherCodes[code] || 'Không xác định';
  };

  const convertTemperature = (temp: number, unit: 'C' | 'F') => {
    return unit === 'F' ? (temp * 9) / 5 + 32 : temp;
  };

  const handleRemoveFavorite = async (index: number) => {
    const newFavorites = favorites.filter((_, i) => i !== index);
    setFavorites(newFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa điểm</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.locationItem}>
            <View style={styles.locationInfo}>
              <Text style={styles.cityName}>{item.city}</Text>
              <Text style={styles.weatherInfo}>
                {convertTemperature(item.weather?.temp || 0, settings.tempUnit).toFixed(1)}°{settings.tempUnit}, {item.weather?.description}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveFavorite(index)}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có địa điểm yêu thích</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/search')}>
        <Text style={styles.addButtonText}>Thêm địa điểm</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2A44',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherInfo: {
    fontSize: 14,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default LocationPage;