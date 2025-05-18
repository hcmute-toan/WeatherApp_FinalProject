import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, Text, StyleSheet, View, TextInput, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentWeather } from '../../services/weather';
import { router, useFocusEffect } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<{ city: string; latitude: number; longitude: number; weather?: { temp: number; description: string; code?: number } }[]>([]);
  const [settings, setSettings] = useState<{ tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph'; notificationTimes?: string[]; uvNotifications?: boolean }>({ tempUnit: 'C', windUnit: 'kmh' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ city: string; latitude: number; longitude: number; weather?: { temp: number; description: string; code?: number } } | null>(null);
  const [detailedWeather, setDetailedWeather] = useState<any>(null);

  const settingsLoadedRef = useRef(false);
  const screenWidth = Dimensions.get('window').width - 20;

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      }
    } catch (err) {
      console.error('Lỗi khi lấy cài đặt:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  useEffect(() => {
    if (!settingsLoadedRef.current) {
      loadSettings();
      settingsLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (selectedCity) {
      handleViewDetails(selectedCity);
    } else if (results.length > 0) {
      handleSearch(searchQuery);
    }
  }, [settings]);

  const debounce = <F extends (...args: any[]) => void>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setResults([]);
      setError(null);
      setSelectedCity(null);
      setDetailedWeather(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedCity(null);
    setDetailedWeather(null);

    try {
      console.log('Gọi API với query:', query);
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);
      const data = await response.json();

      console.log('Phản hồi API:', data);

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
      }

      if (data.results && data.results.length > 0) {
        const searchResults = await Promise.all(
          data.results.map(async (result: any) => {
            try {
              const weather = await getCurrentWeather({ latitude: result.latitude, longitude: result.longitude });
              return {
                city: `${result.name}, ${result.country}`,
                latitude: result.latitude,
                longitude: result.longitude,
                weather: {
                  temp: weather.hourly.temperature_2m[0],
                  description: weatherCodeToText(weather.hourly.weather_code?.[0]),
                  code: weather.hourly.weather_code?.[0],
                },
              };
            } catch (err) {
              console.error(`Lỗi khi lấy thời tiết cho ${result.name}:`, err);
              return {
                city: `${result.name}, ${result.country}`,
                latitude: result.latitude,
                longitude: result.longitude,
                weather: undefined,
              };
            }
          })
        );
        setResults(searchResults);
      } else {
        setResults([]);
        setError(`Không tìm thấy thành phố nào với từ khóa "${query}"`);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      if (error instanceof Error) {
        setError(`Đã có lỗi xảy ra khi tìm kiếm: ${error.message}. Vui lòng thử lại.`);
      } else {
        setError('Đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(debounce((query: string) => handleSearch(query), 500), [handleSearch]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

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

  const handleAddFavorite = async (result: { city: string; latitude: number; longitude: number; weather?: { temp: number; description: string; code?: number } }) => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
      if (!favorites.some((fav: any) => fav.city === result.city)) {
        favorites.push({ city: result.city, latitude: result.latitude, longitude: result.longitude });
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
        router.push('/(tabs)/location');
      } else {
        setError('Thành phố này đã có trong danh sách yêu thích');
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào yêu thích:', error);
      setError('Đã có lỗi khi thêm vào danh sách yêu thích');
    }
  };

  const handleViewDetails = async (result: { city: string; latitude: number; longitude: number; weather?: { temp: number; description: string; code?: number } }) => {
    setSelectedCity(result);
    setError(null);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}&hourly=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max&timezone=Asia/Bangkok`
      );
      if (!response.ok) {
        throw new Error('Lỗi khi gọi API thời tiết');
      }
      const data = await response.json();
      setDetailedWeather(data);
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết thời tiết:', err);
      setError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại.');
    }
  };

  const getSevenDayData = () => {
    if (!detailedWeather || !detailedWeather.daily) return null;

    const today = new Date('2025-05-18');
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const maxTemps = detailedWeather.daily.temperature_2m_max.slice(0, 7).map(temp => convertTemperature(temp, settings.tempUnit));
    const minTemps = detailedWeather.daily.temperature_2m_min.slice(0, 7).map(temp => convertTemperature(temp, settings.tempUnit));
    const windSpeeds = detailedWeather.daily.wind_speed_10m_max?.slice(0, 7) || [0, 0, 0, 0, 0, 0, 0];
    const weatherCodes = detailedWeather.daily.weather_code.slice(0, 7);

    return {
      labels: days,
      datasets: [
        {
          data: maxTemps,
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: minTemps,
          color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Nhiệt độ tối đa', 'Nhiệt độ tối thiểu'],
      windSpeeds,
      weatherCodes,
    };
  };

  const chartData = getSevenDayData();

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
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
      </View>
      {isLoading && <Text style={styles.loadingText}>Đang tìm kiếm...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!selectedCity ? (
        <FlatList
          data={results}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleViewDetails(item)}>
              <View style={styles.resultInfo}>
                {item.weather?.code !== undefined && (
                  <Image source={{ uri: `../assets/icons/${item.weather.code}.png` }} style={styles.weatherIcon} />
                )}
                <Text style={styles.cityName}>{item.city}</Text>
              </View>
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddFavorite(item)}>
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={!isLoading && !error && searchQuery.length >= 3 && (
            <Text style={styles.emptyText}>Không có kết quả</Text>
          )}
        />
      ) : (
        <View style={styles.detailsContainer}>
          <View style={styles.cityHeader}>
            <Text style={styles.cityName}>{selectedCity.city}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddFavorite(selectedCity)}>
              <Text style={styles.addButtonText}>Thêm vào yêu thích</Text>
            </TouchableOpacity>
          </View>
          {detailedWeather && chartData ? (
            <View>
              <Text style={styles.chartTitle}>Dự báo 7 ngày</Text>
              <View style={styles.weatherIcons}>
                {chartData.labels.map((_, index) => (
                  <View key={index} style={styles.iconContainer}>
                    {chartData.weatherCodes[index] !== undefined && (
                      <Image
                        source={{ uri: `../assets/icons/${chartData.weatherCodes[index]}.png` }}
                        style={styles.weatherIconSmall}
                      />
                    )}
                  </View>
                ))}
              </View>
              <LineChart
                data={{
                  labels: chartData.labels,
                  datasets: chartData.datasets,
                  legend: chartData.legend,
                }}
                width={screenWidth}
                height={400}
                yAxisLabel=""
                yAxisSuffix={`°${settings.tempUnit}`}
                yAxisInterval={1}
                formatXLabel={(label, index) => `${label}\n${chartData.windSpeeds[index]} ${settings.windUnit}`}
                chartConfig={{
                  backgroundColor: '#2A3550',
                  backgroundGradientFrom: '#1F2A44',
                  backgroundGradientTo: '#1F2A44',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa500',
                  },
                  propsForLabels: {
                    fontSize: 12,
                    lineHeight: 20, // Tăng khoảng cách giữa các dòng
                    textAnchor: 'middle',
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          ) : (
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          )}
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  weatherIconSmall: {
    width: 30,
    height: 30,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
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
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  weatherIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  iconContainer: {
    alignItems: 'center',
  },
});

export default SearchPage;