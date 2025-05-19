import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, Text, StyleSheet, View, TextInput, FlatList, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
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
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);

  const settingsLoadedRef = useRef(false);
  const prevSettingsRef = useRef<{ tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph' }>({ tempUnit: 'C', windUnit: 'kmh' });
  const screenWidth = Dimensions.get('window').width;

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Cài đặt từ AsyncStorage:', parsedSettings);
        return parsedSettings;
      }
    } catch (err) {
      console.error('Lỗi khi lấy cài đặt:', err);
    }
    return { tempUnit: 'C', windUnit: 'kmh' };
  };

  const applySettings = async () => {
    const newSettings = await loadSettings();
    setSettings(newSettings);
    console.log('Cài đặt mới áp dụng:', newSettings);
    return newSettings;
  };

  useFocusEffect(
    useCallback(() => {
      console.log('Tab focus, bắt đầu kiểm tra cài đặt...');
      const fetchSettingsAndUpdate = async () => {
        const newSettings = await applySettings();
        const settingsChanged = newSettings.tempUnit !== prevSettingsRef.current.tempUnit || newSettings.windUnit !== prevSettingsRef.current.windUnit;
        console.log('So sánh cài đặt:', { prev: prevSettingsRef.current, new: newSettings, changed: settingsChanged });

        if (selectedCity && settingsChanged) {
          console.log('Cài đặt thay đổi, cập nhật dữ liệu chi tiết cho:', selectedCity.city);
          await handleViewDetails(selectedCity);
        }
        prevSettingsRef.current = { tempUnit: newSettings.tempUnit, windUnit: newSettings.windUnit };
      };
      fetchSettingsAndUpdate();
    }, [selectedCity])
  );

  useEffect(() => {
    if (!settingsLoadedRef.current) {
      applySettings().then(newSettings => {
        prevSettingsRef.current = { tempUnit: newSettings.tempUnit, windUnit: newSettings.windUnit };
        settingsLoadedRef.current = true;
        console.log('Cài đặt ban đầu:', newSettings);
      });
    }
  }, []);

  useEffect(() => {
    if (selectedCity && detailedWeather && isDataLoaded && selectedDateIndex !== null) {
      const hourlyTemp = convertTemperature(detailedWeather.hourly.temperature_2m[selectedDateIndex * 24] || detailedWeather.hourly.temperature_2m[0], settings.tempUnit);
      setSelectedCity(prev =>
        prev
          ? {
              ...prev,
              weather: prev.weather
                ? {
                    ...prev.weather,
                    temp: hourlyTemp,
                    description: prev.weather.description ?? '',
                  }
                : { temp: hourlyTemp, description: '', code: undefined },
            }
          : null
      );
    }
  }, [detailedWeather, isDataLoaded, selectedDateIndex, settings.tempUnit]);

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
      setDetailedWeather(null);
      setIsDataLoaded(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedCity(null);
    setDetailedWeather(null);
    setIsDataLoaded(false);

    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
      }

      if (data.results && data.results.length > 0) {
        const searchResults = await Promise.all(
          data.results.map(async (result: any) => {
            try {
              const weather = await getCurrentWeather({ latitude: result.latitude, longitude: result.longitude });
              const temp = convertTemperature(weather.hourly.temperature_2m[0], settings.tempUnit);
              return {
                city: `${result.name}, ${result.country}`,
                latitude: result.latitude,
                longitude: result.longitude,
                weather: {
                  temp: temp,
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
  }, [settings.tempUnit]);

  const debouncedSearch = useCallback(debounce((query: string) => handleSearch(query), 500), [handleSearch]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const weatherCodeToText = (code?: number): string => {
    if (typeof code !== 'number') {
      console.log('Mã thời tiết không hợp lệ:', code);
      return 'Không xác định';
    }
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
    const description = weatherCodes[code] || 'Không xác định';
    console.log(`Mã thời tiết: ${code} -> ${description}`);
    return description;
  };

  const convertTemperature = (temp: number, unit: 'C' | 'F') => {
    if (typeof temp !== 'number' || isNaN(temp)) {
      console.error('Nhiệt độ không hợp lệ:', temp);
      return 0;
    }
    const convertedTemp = unit === 'F' ? (temp * 9) / 5 + 32 : temp;
    console.log(`Chuyển đổi nhiệt độ: ${temp}°C -> ${convertedTemp}${unit}`);
    return Math.round(convertedTemp);
  };

  const convertWindSpeed = (speed: number, unit: 'kmh' | 'mph') => {
    if (typeof speed !== 'number' || isNaN(speed)) {
      console.error('Tốc độ gió không hợp lệ:', speed);
      return 0;
    }
    const convertedSpeed = unit === 'mph' ? speed / 1.60934 : speed;
    console.log(`Chuyển đổi tốc độ gió: ${speed} kmh -> ${convertedSpeed} ${unit}`);
    return Math.round(convertedSpeed);
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
    } catch (err) {
      console.error('Lỗi khi thêm vào yêu thích:', err);
      setError('Đã có lỗi khi thêm vào danh sách yêu thích');
    }
  };

  const handleViewDetails = async (result: { city: string; latitude: number; longitude: number; weather?: { temp: number; description: string; code?: number } }) => {
    setSelectedCity(result);
    setError(null);
    setIsDataLoaded(false);
    setSelectedDateIndex(0);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}&hourly=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max&timezone=Asia/Bangkok`
      );
      if (!response.ok) {
        throw new Error('Lỗi khi gọi API thời tiết');
      }
      const data = await response.json();
      console.log('Dữ liệu thời tiết gốc từ API:', {
        hourlyTemps: data.hourly.temperature_2m.slice(0, 5),
        dailyMaxTemps: data.daily.temperature_2m_max,
        dailyMinTemps: data.daily.temperature_2m_min,
      });

      const adjustedWeather = {
        ...data,
        hourly: {
          ...data.hourly,
          temperature_2m: data.hourly.temperature_2m.map((temp: number) => convertTemperature(temp, settings.tempUnit)),
          wind_speed_10m: data.hourly.wind_speed_10m.map((speed: number) => convertWindSpeed(speed, settings.windUnit)),
        },
        daily: {
          ...data.daily,
          temperature_2m_max: data.daily.temperature_2m_max.map((temp: number) => convertTemperature(temp, settings.tempUnit)),
          temperature_2m_min: data.daily.temperature_2m_min.map((temp: number) => convertTemperature(temp, settings.tempUnit)),
          wind_speed_10m_max: data.daily.wind_speed_10m_max.map((speed: number) => convertWindSpeed(speed, settings.windUnit)),
        },
      };

      setDetailedWeather(adjustedWeather);
      setIsDataLoaded(true);

      if (adjustedWeather.hourly && adjustedWeather.hourly.temperature_2m.length > 0) {
        const initialTemp = adjustedWeather.hourly.temperature_2m[0];
        setSelectedCity(prev =>
          prev
            ? {
                ...prev,
                weather: prev.weather
                  ? {
                      ...prev.weather,
                      temp: initialTemp,
                      description: prev.weather.description ?? '',
                    }
                  : { temp: initialTemp, description: '', code: undefined },
              }
            : null
        );
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết thời tiết:', err);
      setError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại.');
      setIsDataLoaded(false);
    }
  };

  const getFiveDayData = () => {
    if (!detailedWeather || !detailedWeather.daily) return null;
    const today = new Date('2025-05-19');
    const days = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    });

    return {
      days,
      maxTemps: detailedWeather.daily.temperature_2m_max.slice(0, 5),
      minTemps: detailedWeather.daily.temperature_2m_min.slice(0, 5),
      weatherCodes: detailedWeather.daily.weather_code.slice(0, 5),
    };
  };

  const get24HourData = (index: number | null = 0) => {
    if (!detailedWeather || !detailedWeather.hourly) return null;
    const startIndex = index !== null ? index * 24 : 0;
    const hours = detailedWeather.hourly.time.slice(startIndex, startIndex + 24).map((time: string) => time.split('T')[1].slice(0, 5));
    const temps = detailedWeather.hourly.temperature_2m.slice(startIndex, startIndex + 24);
    const windSpeeds = detailedWeather.hourly.wind_speed_10m.slice(startIndex, startIndex + 24);

    return { hours, temps, windSpeeds };
  };

  const fiveDayData = isDataLoaded ? getFiveDayData() : null;
  const twentyFourHourData = isDataLoaded && selectedDateIndex !== null ? get24HourData(selectedDateIndex) : null;

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
          ListEmptyComponent={
            !isLoading && !error && searchQuery.length >= 3
              ? <Text style={styles.emptyText}>Không có kết quả</Text>
              : null
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.detailsContainer}>
          {isDataLoaded && fiveDayData ? (
            <>
              <View style={styles.currentWeather}>
                <Text style={styles.cityName}>{selectedCity.city}</Text>
                {selectedCity.weather && (
                  <>
                    <Text style={styles.currentTemp}>{Math.round(selectedCity.weather.temp)}°</Text>
                    <Text style={styles.weatherCondition}>
                      {weatherCodeToText(fiveDayData.weatherCodes[selectedDateIndex ?? 0])} {fiveDayData.maxTemps[selectedDateIndex ?? 0]}°/{fiveDayData.minTemps[selectedDateIndex ?? 0]}°
                    </Text>
                    <Text style={styles.aqi}>AQI 48</Text>
                  </>
                )}
                <TouchableOpacity style={styles.addFavoriteButton} onPress={() => handleAddFavorite(selectedCity)}>
                  <Text style={styles.addFavoriteButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.fiveDayForecast}>
                <Text style={styles.sectionTitle}>Dự báo 5 ngày</Text>
                <View style={styles.forecastList}>
                  {fiveDayData.days.map((day, index) => (
                    <TouchableOpacity key={index} style={styles.forecastItem} onPress={() => setSelectedDateIndex(index)}>
                      <Text style={[styles.forecastDay, selectedDateIndex === index && styles.selectedDay]}>{day}</Text>
                      <Image
                        source={{ uri: `../assets/icons/${fiveDayData.weatherCodes[index]}.png` }}
                        style={styles.forecastIcon}
                      />
                      <Text style={styles.forecastTemp}>{fiveDayData.minTemps[index]}° - {fiveDayData.maxTemps[index]}°</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.twentyFourHourForecast}>
                <Text style={styles.sectionTitle}>Dự báo 24 giờ</Text>
                {twentyFourHourData && twentyFourHourData.hours.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={styles.chartContainer}>
                      <LineChart
                        data={{
                          labels: twentyFourHourData.hours,
                          datasets: [{
                            data: twentyFourHourData.temps,
                            color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
                            strokeWidth: 2,
                          }],
                          legend: ['Nhiệt độ'],
                        }}
                        width={1200}
                        height={400}
                        yAxisLabel=""
                        yAxisSuffix={`°${settings.tempUnit}`}
                        yAxisInterval={1}
                        fromZero
                        chartConfig={{
                          backgroundColor: '#2A3550',
                          backgroundGradientFrom: '#1F2A44',
                          backgroundGradientTo: '#1F2A44',
                          decimalPlaces: 0,
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
                            fontSize: 14,
                          },
                        }}
                        bezier
                        style={styles.chart}
                      />
                      {twentyFourHourData.windSpeeds.length > 0 && (
                        <View style={styles.windSpeedOverlay}>
                          <View style={styles.windSpeedRow}>
                            {twentyFourHourData.windSpeeds.map((speed: number, index: number) => (
                              <Text key={index} style={styles.windSpeedText}>
                                {Math.round(speed)} {settings.windUnit}
                              </Text>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                ) : (
                  <Text style={styles.loadingText}>Không có dữ liệu 24 giờ</Text>
                )}
              </View>
              <View style={styles.additionalInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>UV</Text>
                  <Text style={styles.infoValue}>11</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Độ ẩm</Text>
                  <Text style={styles.infoValue}>69%</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Cảm giác nhiệt</Text>
                  <Text style={styles.infoValue}>36°</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Đông Nam</Text>
                  <Text style={styles.infoValue}>16.7</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  cityName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  currentTemp: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherCondition: {
    fontSize: 18,
    color: '#fff',
  },
  aqi: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 5,
    borderRadius: 10,
    marginTop: 5,
  },
  fiveDayForecast: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  forecastList: {
    flexDirection: 'column',
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  forecastDay: {
    color: '#fff',
    fontSize: 16,
  },
  selectedDay: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  forecastIcon: {
    width: 30,
    height: 30,
  },
  forecastTemp: {
    color: '#fff',
    fontSize: 16,
  },
  twentyFourHourForecast: {
    marginBottom: 20,
  },
  chartContainer: {
    position: 'relative',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  windSpeedOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 60,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  windSpeedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 1200 - 60,
  },
  windSpeedText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    width: 50,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    width: '23%',
  },
  infoTitle: {
    fontSize: 12,
    color: '#fff',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
    padding: 20,
    paddingBottom: 50,
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
  addFavoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFavoriteButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 20,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default SearchPage;