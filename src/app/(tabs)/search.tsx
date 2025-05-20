import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, Text, StyleSheet, View, TextInput, FlatList, TouchableOpacity, Image, Dimensions, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';
import { getCurrentWeather } from '../../services/weather';
import { router, useFocusEffect } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<{ city: string; latitude: number; longitude: number; weather?: { temp: number; description: string; code?: number } }[]>([]);
  const [settings, setSettings] = useState<{ tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph' }>({ tempUnit: 'C', windUnit: 'kmh' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ city: string; latitude: number; longitude: number; weather?: { temp: number; description: string; code?: number } } | null>(null);
  const [detailedWeather, setDetailedWeather] = useState<any>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const settingsLoadedRef = useRef(false);
  const prevSettingsRef = useRef<{ tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph' }>({ tempUnit: 'C', windUnit: 'kmh' });
  const screenWidth = Dimensions.get('window').width;

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        return parsedSettings;
      }
    } catch (err) {
      console.error('Lỗi tải cài đặt:', err);
    }
    return { tempUnit: 'C', windUnit: 'kmh' };
  };

  const applySettings = async () => {
    const newSettings = await loadSettings();
    setSettings(newSettings);
    return newSettings;
  };

  useFocusEffect(
    useCallback(() => {
      const fetchSettingsAndUpdate = async () => {
        const newSettings = await applySettings();
        const settingsChanged = newSettings.tempUnit !== prevSettingsRef.current.tempUnit || newSettings.windUnit !== prevSettingsRef.current.windUnit;

        if (selectedCity && settingsChanged) {
          await handleViewDetails(selectedCity);
        }
        prevSettingsRef.current = { tempUnit: newSettings.tempUnit, windUnit: 'kmh' };
      };
      fetchSettingsAndUpdate();
    }, [selectedCity])
  );

  useEffect(() => {
    if (!settingsLoadedRef.current) {
      applySettings().then(newSettings => {
        prevSettingsRef.current = { tempUnit: newSettings.tempUnit, windUnit: newSettings.windUnit };
        settingsLoadedRef.current = true;
      });
    }

    // Khởi tạo nhận diện giọng nói
    const initializeVoice = async () => {
      try {
        if (!Voice) {
          setError('Thư viện nhận diện giọng nói không khả dụng. Vui lòng kiểm tra cấu hình dự án.');
          return;
        }
        Voice.onSpeechResults = (e: any) => {
          const result = e.value[0];
          if (result) {
            setSearchQuery(result);
            handleSearch(result);
          }
          setIsRecording(false);
        };
        Voice.onSpeechError = (e: any) => {
          console.error('Lỗi nhận diện giọng nói:', e);
          setError('Không thể nhận diện giọng nói. Vui lòng thử lại hoặc kiểm tra quyền micro.');
          setIsRecording(false);
        };
      } catch (err) {
        console.error('Lỗi khởi tạo nhận diện giọng nói:', err);
        setError('Không thể khởi tạo nhận diện giọng nói. Vui lòng kiểm tra cấu hình.');
      }
    };
    initializeVoice();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(err => console.error('Lỗi dọn dẹp Voice:', err));
    };
  }, []);

  const startVoiceRecognition = async () => {
    if (!Voice) {
      setError('Thư viện nhận diện giọng nói không khả dụng. Vui lòng kiểm tra cấu hình dự án.');
      return;
    }
    try {
      setIsRecording(true);
      setError(null);
      await Voice.start('vi-VN');
    } catch (err) {
      console.error('Lỗi bắt đầu nhận diện giọng nói:', err);
      setError('Không thể bắt đầu nhận diện giọng nói. Vui lòng kiểm tra quyền micro hoặc cấu hình.');
      setIsRecording(false);
    }
  };

  const stopVoiceRecognition = async () => {
    if (!Voice) {
      setError('Thư viện nhận diện giọng nói không khả dụng.');
      return;
    }
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('Lỗi dừng nhận diện giọng nói:', err);
      setError('Không thể dừng nhận diện giọng nói.');
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (selectedCity && detailedWeather && isDataLoaded && selectedDateIndex !== null) {
      const hourlyTemp = detailedWeather.hourly.temperature_2m[selectedDateIndex * 24] || detailedWeather.hourly.temperature_2m[0];
      setSelectedCity(prev =>
        prev
          ? {
              ...prev,
              weather: prev.weather
                ? {
                    ...prev.weather,
                    temp: Math.round(hourlyTemp),
                    description: prev.weather.description ?? '',
                  }
                : { temp: Math.round(hourlyTemp), description: '', code: undefined },
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
              console.error(`Lỗi lấy thời tiết cho ${result.name}:`, err);
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
      console.error('Lỗi tìm kiếm:', error);
      setError('Đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
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
    return weatherCodes[code] || 'Không xác định';
  };

  const convertTemperature = (temp: number, unit: 'C' | 'F') => {
    if (typeof temp !== 'number' || isNaN(temp)) {
      console.error('Nhiệt độ không hợp lệ:', temp);
      return 0;
    }
    const convertedTemp = unit === 'F' ? (temp * 9) / 5 + 32 : temp;
    return Math.round(convertedTemp);
  };

  const convertWindSpeed = (speed: number, unit: 'kmh' | 'mph') => {
    if (typeof speed !== 'number' || isNaN(speed)) {
      console.error('Tốc độ gió không hợp lệ:', speed);
      return 0;
    }
    const convertedSpeed = unit === 'mph' ? speed / 1.60934 : speed;
    return Math.round(convertedSpeed);
  };

  const getWindDirectionText = (degrees: number): string => {
    if (typeof degrees !== 'number' || isNaN(degrees)) return 'Không xác định';
    const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const formatSunsetTime = (sunsetISO: string): string => {
    const date = new Date(sunsetISO);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
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
      console.error('Lỗi thêm vào yêu thích:', err);
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
        `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,apparent_temperature,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code,sunset&timezone=Asia/Bangkok`
      );
      if (!response.ok) {
        throw new Error('Lỗi lấy API thời tiết');
      }
      const data = await response.json();

      const adjustedWeather = {
        ...data,
        hourly: {
          ...data.hourly,
          temperature_2m: data.hourly.temperature_2m.map((temp: number) => convertTemperature(temp, settings.tempUnit)),
          apparent_temperature: data.hourly.apparent_temperature.map((temp: number) => convertTemperature(temp, settings.tempUnit)),
          wind_speed_10m: data.hourly.wind_speed_10m.map((speed: number) => convertWindSpeed(speed, settings.windUnit)),
        },
        daily: {
          ...data.daily,
          temperature_2m_max: data.daily.temperature_2m_max.map((temp: number) => convertTemperature(temp, settings.tempUnit)),
          temperature_2m_min: data.daily.temperature_2m_min.map((temp: number) => convertTemperature(temp, settings.tempUnit)),
          uv_index_max: data.daily.uv_index_max || [0],
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
      console.error('Lỗi lấy chi tiết thời tiết:', err);
      setError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại.');
      setIsDataLoaded(false);
    }
  };

  const getFiveDayData = () => {
    if (!detailedWeather || !detailedWeather.daily) return null;
    const today = new Date();
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
      sunsets: detailedWeather.daily.sunset.slice(0, 5),
      uvIndices: detailedWeather.daily.uv_index_max.slice(0, 5) || [0],
    };
  };

  const get24HourData = (index: number | null = 0) => {
    if (!detailedWeather || !detailedWeather.hourly) return null;
    const startIndex = index !== null ? index * 24 : 0;
    const hours = detailedWeather.hourly.time.slice(startIndex, startIndex + 24).map((time: string) => time.split('T')[1].slice(0, 5));
    const temps = detailedWeather.hourly.temperature_2m.slice(startIndex, startIndex + 24);
    const windSpeeds = detailedWeather.hourly.wind_speed_10m.slice(startIndex, startIndex + 24);
    const windDirections = detailedWeather.hourly.wind_direction_10m.slice(startIndex, startIndex + 24);
    const feelsLike = detailedWeather.hourly.apparent_temperature.slice(startIndex, startIndex + 24);
    const uvIndices = detailedWeather.hourly.uv_index?.slice(startIndex, startIndex + 24) || Array(24).fill(0);

    return { hours, temps, windSpeeds, windDirections, feelsLike, uvIndices };
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
        <TouchableOpacity
          style={styles.micButton}
          onPress={isRecording ? stopVoiceRecognition : startVoiceRecognition}
        >
          <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={24} color="#fff" />
        </TouchableOpacity>
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
                <Text style={styles.addButtonText}>+</Text>
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
                    <Text style={styles.currentTemp}>{Math.round(selectedCity.weather.temp)}°{settings.tempUnit}</Text>
                    <Text style={styles.weatherCondition}>
                      {weatherCodeToText(fiveDayData.weatherCodes[selectedDateIndex ?? 0])} {Math.round(fiveDayData.maxTemps[selectedDateIndex ?? 0])}°/{Math.round(fiveDayData.minTemps[selectedDateIndex ?? 0])}°
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
                      <Text style={styles.forecastTemp}>{Math.round(fiveDayData.minTemps[index])}° - {Math.round(fiveDayData.maxTemps[index])}°</Text>
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
                  <Text style={styles.infoValue}>
                    {Math.round(
                      selectedDateIndex !== null && fiveDayData?.uvIndices[selectedDateIndex] !== undefined
                        ? fiveDayData.uvIndices[selectedDateIndex]
                        : 0
                    )}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Độ ẩm</Text>
                  <Text style={styles.infoValue}>{detailedWeather.hourly.relative_humidity_2m?.[0] || 'N/A'}%</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Cảm giác như</Text>
                  <Text style={styles.infoValue}>{Math.round(twentyFourHourData?.feelsLike[0] || 0)}°{settings.tempUnit}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Hướng</Text>
                  <Text style={styles.infoValue}>{getWindDirectionText(twentyFourHourData?.windDirections[0] || 0)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Hoàng hôn</Text>
                  <Text style={styles.infoValue}>
                    {formatSunsetTime(
                      selectedDateIndex !== null && fiveDayData?.sunsets[selectedDateIndex] !== undefined
                        ? fiveDayData.sunsets[selectedDateIndex]
                        : '2025-05-20T18:09:00Z'
                    )}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Áp suất</Text>
                  <Text style={styles.infoValue}>{detailedWeather.hourly.pressure_msl?.[0] || 'N/A'} mb</Text>
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
    marginRight: 10,
    color: '#fff',
  },
  micButton: {
    padding: 10,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
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
    fontSize: 18,
    fontWeight: '600',
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    width: '30%',
    marginBottom: 10,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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