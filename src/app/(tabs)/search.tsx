import { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, TextInput, FlatList, View, TouchableOpacity } from 'react-native';
import { APP_COLOR } from '../../utils/constant';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchCity, getCurrentWeather, getHourlyForecast, getDailyForecast } from '../../services/weather';
import { City, WeatherData, HourlyForecast, DailyForecast } from '../../types/weather';
import { router } from 'expo-router';
import CustomFlatList from '../../components/CustomFlatList/CustomFlatList';
import HourlyForecastItem from '../../components/HourlyForecastItem';

const PlaceholderIcon = ({ style }: { style?: object }) => (
  <View style={[{ width: 50, height: 50, backgroundColor: '#ccc', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }, style]}>
    <Text style={{ color: '#fff' }}>Icon</Text>
  </View>
);

const SearchTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<City[]>([]);
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherData }>({});
  const [favorites, setFavorites] = useState<City[]>([]);
  const [settings, setSettings] = useState<{ tempUnit: 'C' | 'F' }>({ tempUnit: 'C' });

  useEffect(() => {
    (async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favoriteCities');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading favorites or settings:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      (async () => {
        try {
          const cities = await searchCity(searchQuery);
          setLocations(cities);
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
        } catch (error) {
          console.error('Lỗi khi tìm kiếm thành phố:', error);
        }
      })();
    } else {
      setLocations([]);
      setWeatherData({});
    }
  }, [searchQuery]);

  const addToFavorites = async (city: City) => {
    try {
      const newFavorites = [...favorites, city];
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favoriteCities', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorite:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient style={styles.gradient} colors={['#1F2A44', '#2A3550']} locations={[0, 0.8]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thành phố..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
        <CustomFlatList
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const weather = weatherData[item.id.toString()];
            const WeatherIcon = getWeatherIconComponent(weather?.hourly.weather_code?.[0], weather?.hourly.is_day?.[0]);
            const isFavorite = favorites.some((fav) => fav.id === item.id);
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
                <TouchableOpacity
                  style={[styles.favoriteButton, isFavorite ? styles.favoriteButtonActive : null]}
                  onPress={() => addToFavorites(item)}
                  disabled={isFavorite}
                >
                  <Text style={styles.favoriteButtonText}>{isFavorite ? 'Đã thêm' : 'Thêm'}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy kết quả</Text>}
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
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 15,
    elevation: 2,
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
  favoriteButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  favoriteButtonActive: {
    backgroundColor: '#ccc',
  },
  favoriteButtonText: {
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

export default SearchTab;