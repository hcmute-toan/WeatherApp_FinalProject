import { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentWeather } from '../../services/weather';
import { City, WeatherData } from '../../types/weather';

const PlaceholderIcon = ({ style }: { style?: object }) => (
  <View style={[{ width: 50, height: 50, backgroundColor: '#ccc', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }, style]}>
    <Text style={{ color: '#fff' }}>Icon</Text>
  </View>
);

const LocationTab = () => {
  const [favorites, setFavorites] = useState<City[]>([]);
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherData }>({});

  useEffect(() => {
    (async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favoriteCities');
        if (savedFavorites) {
          const cities: City[] = JSON.parse(savedFavorites);
          setFavorites(cities);
          const weatherPromises = cities.map(async (city) => {
            const weather = await getCurrentWeather({ latitude: city.latitude, longitude: city.longitude });
            return { id: city.id.toString(), weather };
          });
          const weatherResults = await Promise.all(weatherPromises);
          const newWeatherData = weatherResults.reduce((acc, { id, weather }) => {
            acc[id] = weather;
            return acc;
          }, {} as { [key: string]: WeatherData });
          setWeatherData(newWeatherData);
        }
      } catch (error) {
        console.error('Error loading favorites or weather:', error);
      }
    })();
  }, []);

  const removeFavorite = async (cityId: number) => {
    try {
      const newFavorites = favorites.filter((city) => city.id !== cityId);
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favoriteCities', JSON.stringify(newFavorites));
      setWeatherData((prev) => {
        const newData = { ...prev };
        delete newData[cityId.toString()];
        return newData;
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const weatherCodeToText = (code?: number): string => {
    if (!code) return 'Không xác định';
    const weatherCodes: { [key: number]: string } = {
      0: 'Trời quang',
      1: 'Gần như quang đãng',
      2: 'Có mây rải rác',
      3: 'Nhiều mây',
      45: 'Sương mù',
      48: 'Sương mù có băng giá',
      51: 'Mưa phùn nhẹ',
      53: 'Mưa phùn vừa',
      55: 'Mưa phùn dày',
      61: 'Mưa nhẹ',
      63: 'Mưa vừa',
      65: 'Mưa to',
      80: 'Mưa rào nhẹ',
      81: 'Mưa rào vừa',
      82: 'Mưa rào mạnh',
      95: 'Dông bão',
      96: 'Dông bão kèm mưa đá nhẹ',
      99: 'Dông bão kèm mưa đá lớn',
    };
    return weatherCodes[code] || 'Không xác định';
  };

  const getWeatherIconComponent = (code: number | undefined, isDay: number | undefined) => {
    return PlaceholderIcon;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient style={styles.gradient} colors={['#1F2A44', '#2A3550']} locations={[0, 0.8]}>
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const weather = weatherData[item.id.toString()];
            const WeatherIcon = getWeatherIconComponent(weather?.hourly.weather_code?.[0], weather?.hourly.is_day?.[0]);
            return (
              <View style={styles.locationItem}>
                <WeatherIcon style={styles.itemIcon} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.name}, {item.country}</Text>
                  <Text style={styles.itemDetails}>
                    {weather?.hourly.temperature_2m[0] || '--'}°C, {weatherCodeToText(weather?.hourly.weather_code?.[0])}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFavorite(item.id)}
                >
                  <Text style={styles.removeButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có thành phố yêu thích</Text>}
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
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemIcon: {
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemDetails: {
    fontSize: 16,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default LocationTab;