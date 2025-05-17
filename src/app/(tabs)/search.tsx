import { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentWeather } from '../../services/weather';
import { router } from 'expo-router';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<{ city: string; latitude: number; longitude: number; weather?: { temp: number; description: string } }[]>([]);
  const [settings, setSettings] = useState<{ tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph' }>({ tempUnit: 'C', windUnit: 'kmh' });

  useEffect(() => {
    (async () => {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}`);
      const data = await response.json();
      if (data.results) {
        const searchResults = await Promise.all(
          data.results.slice(0, 5).map(async (result: any) => {
            const weather = await getCurrentWeather({ latitude: result.latitude, longitude: result.longitude });
            return {
              city: `${result.name}, ${result.country}`,
              latitude: result.latitude,
              longitude: result.longitude,
              weather: {
                temp: weather.hourly.temperature_2m[0],
                description: weatherCodeToText(weather.hourly.weather_code?.[0]),
              },
            };
          })
        );
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

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

  const handleAddFavorite = async (result: { city: string; latitude: number; longitude: number; weather?: { temp: number; description: string } }) => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
      if (!favorites.some((fav: any) => fav.city === result.city)) {
        favorites.push({ city: result.city, latitude: result.latitude, longitude: result.longitude });
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
        router.push('/(tabs)/location');
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thành phố..."
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <View style={styles.resultInfo}>
              <Text style={styles.cityName}>{item.city}</Text>
              <Text style={styles.weatherInfo}>
                {convertTemperature(item.weather?.temp || 0, settings.tempUnit).toFixed(1)}°{settings.tempUnit}, {item.weather?.description}
              </Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddFavorite(item)}>
              <Text style={styles.addButtonText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có kết quả</Text>}
      />
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
    alignItems: 'center',
    padding: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
    color: '#fff',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  resultInfo: {
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
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default SearchPage;