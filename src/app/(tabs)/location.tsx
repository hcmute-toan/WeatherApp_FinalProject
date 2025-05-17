import { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentWeather, getCurrentLocation, getHourlyForecast, getDailyForecast } from '../../services/weather';
import { City, WeatherData } from '../../types/weather';
import { router } from 'expo-router';
import CustomFlatList from '@/src/components/CustomFlatList/CustomFlatList';

const PlaceholderIcon = ({ style }: { style?: object }) => (
  <View style={[{ width: 50, height: 50, backgroundColor: '#ccc', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }, style]}>
    <Text style={{ color: '#fff' }}>Icon</Text>
  </View>
);

const LocationTab = () => {
  const [favorites, setFavorites] = useState<City[]>([]);
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherData }>({});
  const [currentLocation, setCurrentLocation] = useState<City | null>(null);
  const [settings, setSettings] = useState<{ tempUnit: 'C' | 'F' }>({ tempUnit: 'C' });

  useEffect(() => {
    (async () => {
      try {
        const loc = await getCurrentLocation();
        const cityResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${loc.latitude}&longitude=${loc.longitude}`);
        const cityData = await cityResponse.json();
        const city: City = {
          id: 0,
          name: cityData.results?.[0]?.name || 'Vị trí hiện tại',
          latitude: loc.latitude,
          longitude: loc.longitude,
          country: cityData.results?.[0]?.country || 'Việt Nam',
        };
        setCurrentLocation(city);

        const savedFavorites = await AsyncStorage.getItem('favoriteCities');
        if (savedFavorites) {
          const cities: City[] = JSON.parse(savedFavorites);
          setFavorites(cities);
        }

        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }

        const weatherPromises = [
          { id: 'current', weather: await getCurrentWeather({ latitude: city.latitude, longitude: city.longitude }) },
          ...(savedFavorites
            ? JSON.parse(savedFavorites).map(async (city: City) => ({
                id: city.id.toString(),
                weather: await getCurrentWeather({ latitude: city.latitude, longitude: city.longitude }),
              }))
            : []),
        ];
        const weatherResults = await Promise.all(weatherPromises);
        const newWeatherData = weatherResults.reduce((acc, { id, weather }) => {
          acc[id] = weather;
          return acc;
        }, {} as { [key: string]: WeatherData });
        setWeatherData(newWeatherData);
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

  const viewCityWeather = async (city: City) => {
    try {
      const [weather, hourly, daily] = await Promise.all([
        getCurrentWeather({ latitude: city.latitude, longitude: city.longitude }),
        getHourlyForecast({ latitude: city.latitude, longitude: city.longitude }),
        getDailyForecast({ latitude: city.latitude, longitude: city.longitude }),
      ]);
      router.push({
        pathname: '/(tabs)/cityWeather',
        params: {
          city: JSON.stringify(city),
          weather: JSON.stringify(weather),
          hourly: JSON.stringify(hourly),
          daily: JSON.stringify(daily),
        },
      });
    } catch (error) {
      console.error('Error fetching city weather:', error);
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

  const convertTemperature = (temp: number) => {
    return settings.tempUnit === 'F' ? (temp * 9) / 5 + 32 : temp;
  };

  const data = currentLocation ? [currentLocation, ...favorites] : favorites;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient style={styles.gradient} colors={['#1F2A44', '#2A3550']} locations={[0, 0.8]}>
        <CustomFlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const weather = weatherData[item.id === 0 ? 'current' : item.id.toString()];
            const WeatherIcon = getWeatherIconComponent(weather?.hourly.weather_code?.[0], weather?.hourly.is_day?.[0]);
            return (
              <TouchableOpacity style={styles.locationItem} onPress={() => viewCityWeather(item)}>
                <WeatherIcon style={styles.itemIcon} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.name}, {item.country}</Text>
                  <Text style={styles.itemDetails}>
                    {weather ? convertTemperature(weather.hourly.temperature_2m[0]).toFixed(1) : '--'}°{settings.tempUnit},{' '}
                    {weatherCodeToText(weather?.hourly.weather_code?.[0])}
                  </Text>
                </View>
                {item.id !== 0 && (
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeFavorite(item.id)}>
                    <Text style={styles.removeButtonText}>Xóa</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
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