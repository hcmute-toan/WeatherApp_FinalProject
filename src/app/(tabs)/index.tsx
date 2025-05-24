import { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, Text, StyleSheet, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Dimensions } from 'react-native';
import * as Location from 'expo-location';

const PlaceholderIcon = ({ style, code }: { style?: object; code?: number }) => (
  <Image
    source={{ uri: `../assets/icons/${code || 0}.png` }}
    style={[{ width: 40, height: 40 }, style]}
    defaultSource={require('../../assets/icons/0.png')}
  />
);

const HomeTab = () => {
  const { latitude, longitude, city } = useLocalSearchParams();
  const [location, setLocation] = useState<{ city: string; latitude: number; longitude: number } | null>(null);
  const [detailedWeather, setDetailedWeather] = useState<any>(null);
  const [settings, setSettings] = useState<{ tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph' }>({ tempUnit: 'C', windUnit: 'kmh' });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const screenWidth = Dimensions.get('window').width;

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Quyền truy cập vị trí bị từ chối. Vui lòng bật vị trí trong cài đặt.');
      }

      const deviceLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

      // Try Open-Meteo geocoding API first
      let cityName = null;
      try {
        const cityResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${deviceLoc.coords.latitude}&longitude=${deviceLoc.coords.longitude}&language=vi`
        );
        const cityData = await cityResponse.json();
        cityName = cityData.results?.[0]?.name || cityData.city || null;
      } catch (err) {
        console.warn('Open-Meteo geocoding failed:', err);
      }

      // Fallback to Nominatim if Open-Meteo fails
      if (!cityName) {
        try {
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${deviceLoc.coords.latitude}&lon=${deviceLoc.coords.longitude}&zoom=10&addressdetails=1`
          );
          const nominatimData = await nominatimResponse.json();
          cityName = nominatimData.address.city || nominatimData.address.town || nominatimData.address.village || 'Unknown City';
        } catch (err) {
          console.warn('Nominatim geocoding failed:', err);
          throw new Error('Không thể xác định tên thành phố từ vị trí hiện tại.');
        }
      }

      const location = {
        city: cityName,
        latitude: deviceLoc.coords.latitude,
        longitude: deviceLoc.coords.longitude,
      };

      // Save as default location if none exists
      const defaultLocation = await AsyncStorage.getItem('defaultLocation');
      if (!defaultLocation) {
        await AsyncStorage.setItem('defaultLocation', JSON.stringify(location));
        // Add to favorites with isDefault: true
        const savedFavorites = await AsyncStorage.getItem('favorites');
        const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
        if (!favorites.some((fav: any) => fav.city === location.city)) {
          favorites.push({ ...location, isDefault: true });
          await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
        }
      }

      return location;
    } catch (err) {
      console.error('Error fetching location:', err);
      throw err;
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
    return { tempUnit: 'C', windUnit: 'kmh' };
  };

  const loadLocation = async () => {
    try {
      const savedSettings = await loadSettings();
      setSettings(savedSettings);
      let loc: { city: string; latitude: number; longitude: number };

      // Check for passed params first
      if (latitude && longitude && city && !isNaN(parseFloat(latitude as string)) && !isNaN(parseFloat(longitude as string))) {
        loc = {
          city: city as string,
          latitude: parseFloat(latitude as string),
          longitude: parseFloat(longitude as string),
        };
      } else {
        // Prioritize default location
        const defaultLocation = await AsyncStorage.getItem('defaultLocation');
        if (defaultLocation) {
          loc = JSON.parse(defaultLocation);
        } else {
          loc = await fetchLocation();
        }
      }

      if (
        !location ||
        loc.city !== location.city ||
        loc.latitude !== location.latitude ||
        loc.longitude !== location.longitude
      ) {
        setLocation(loc);
        await fetchWeatherData(loc, savedSettings);
      } else if (
        savedSettings.tempUnit !== settings.tempUnit ||
        savedSettings.windUnit !== settings.windUnit
      ) {
        await fetchWeatherData(loc, savedSettings);
      }
    } catch (err) {
      console.error('Error loading location:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu vị trí hoặc thời tiết. Vui lòng thử lại.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLocation();
    }, [latitude, longitude, city])
  );

  const fetchWeatherData = useCallback(
    async (loc: { city: string; latitude: number; longitude: number }, currentSettings: { tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph' }) => {
      setIsDataLoaded(false);
      setError(null);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,apparent_temperature,uv_index,pressure_msl&daily=temperature_2m_max,temperature_2m_min,weather_code,sunset,uv_index_max&timezone=Asia/Bangkok`
        );
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        if (!data.hourly || !data.daily) {
          throw new Error('API response missing hourly or daily data');
        }

        const adjustedWeather = {
          ...data,
          hourly: {
            ...data.hourly,
            temperature_2m: data.hourly.temperature_2m?.map((temp: number) => convertTemperature(temp, currentSettings.tempUnit)) || [],
            apparent_temperature: data.hourly.apparent_temperature?.map((temp: number) => convertTemperature(temp, currentSettings.tempUnit)) || [],
            wind_speed_10m: data.hourly.wind_speed_10m?.map((speed: number) => convertWindSpeed(speed, currentSettings.windUnit)) || [],
            wind_direction_10m: data.hourly.wind_direction_10m || [],
            relative_humidity_2m: data.hourly.relative_humidity_2m || [],
            uv_index: data.hourly.uv_index || [],
            pressure_msl: data.hourly.pressure_msl || [],
            time: data.hourly.time || [],
          },
          daily: {
            ...data.daily,
            temperature_2m_max: data.daily.temperature_2m_max?.map((temp: number) => convertTemperature(temp, currentSettings.tempUnit)) || [],
            temperature_2m_min: data.daily.temperature_2m_min?.map((temp: number) => convertTemperature(temp, currentSettings.tempUnit)) || [],
            uv_index_max: data.daily.uv_index_max || [],
            sunset: data.daily.sunset || [],
          },
        };

        setDetailedWeather(adjustedWeather);
        setSettings(currentSettings);
        setIsDataLoaded(true);
      } catch (err) {
        console.error('Error fetching detailed weather:', err);
        setError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại.');
        setIsDataLoaded(false);
      }
    },
    []
  );

  const convertTemperature = (temp: number, unit: 'C' | 'F') => {
    if (typeof temp !== 'number' || isNaN(temp)) return 0;
    return Math.round(unit === 'F' ? (temp * 9) / 5 + 32 : temp);
  };

  const convertWindSpeed = (speed: number, unit: 'kmh' | 'mph') => {
    if (typeof speed !== 'number' || isNaN(speed)) return 0;
    return Math.round(unit === 'mph' ? speed / 1.60934 : speed);
  };

  const weatherCodeToText = (code?: number): string => {
    if (typeof code !== 'number') return 'Không xác định';
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

  const getFiveDayData = () => {
    if (!detailedWeather || !detailedWeather.daily) return null;
    const today = new Date();
    const days = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    return {
      days,
      maxTemps: detailedWeather.daily.temperature_2m_max || [],
      minTemps: detailedWeather.daily.temperature_2m_min || [],
      weatherCodes: detailedWeather.daily.weather_code || [],
      sunsets: detailedWeather.daily.sunset || [],
      uvIndices: detailedWeather.daily.uv_index_max || [],
    };
  };

  const get24HourData = (index: number = 0) => {
    if (!detailedWeather || !detailedWeather.hourly) return null;
    const startIndex = index * 24;
    const hours = detailedWeather.hourly.time?.slice(startIndex, startIndex + 24).map((time: string) => time.split('T')[1].slice(0, 5)) || [];
    const temps = detailedWeather.hourly.temperature_2m?.slice(startIndex, startIndex + 24) || [];
    const windSpeeds = detailedWeather.hourly.wind_speed_10m?.slice(startIndex, startIndex + 24) || [];
    const windDirections = detailedWeather.hourly.wind_direction_10m?.slice(startIndex, startIndex + 24) || [];
    const feelsLike = detailedWeather.hourly.apparent_temperature?.slice(startIndex, startIndex + 24) || [];
    const uvIndices = detailedWeather.hourly.uv_index?.slice(startIndex, startIndex + 24) || [];
    const pressure = detailedWeather.hourly.pressure_msl?.slice(startIndex, startIndex + 24) || [];

    const filteredHours = hours.map((hour: string, idx: number) => (idx % 3 === 0 ? hour : ''));

    return { hours: filteredHours, rawHours: hours, temps, windSpeeds, windDirections, feelsLike, uvIndices, pressure };
  };

  const fiveDayData = isDataLoaded ? getFiveDayData() : null;
  const twentyFourHourData = isDataLoaded && selectedDateIndex !== null ? get24HourData(selectedDateIndex) : null;

  const currentDate = new Date();
  const currentHour = currentDate.getHours();

  if (!location || !isDataLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đang tải...</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.loadingText}>{error || 'Đang tải dữ liệu...'}</Text>
        {error && (
          <TouchableOpacity style={styles.retryButton} onPress={loadLocation}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{location.city}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.detailsContainer}>
        <View style={styles.currentWeather}>
          <Text style={styles.cityName}>{location.city}</Text>
          <Text style={styles.currentTemp}>
            {Math.round(detailedWeather.hourly.temperature_2m[0] || 0)}°{settings.tempUnit}
          </Text>
          <Text style={styles.weatherCondition}>
            {weatherCodeToText(fiveDayData?.weatherCodes[selectedDateIndex] || detailedWeather.hourly.weather_code?.[0] || 0)}{' '}
            {Math.round(fiveDayData?.maxTemps[selectedDateIndex] || 0)}°/{Math.round(fiveDayData?.minTemps[selectedDateIndex] || 0)}°
          </Text>
          <Text style={styles.aqi}>AQI N/A</Text>
        </View>
        <View style={styles.fiveDayForecast}>
          <Text style={styles.sectionTitle}>Dự báo 5 ngày</Text>
          <View style={styles.forecastList}>
            {fiveDayData?.days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={styles.forecastItem}
                onPress={() => setSelectedDateIndex(index)}
              >
                <Text style={[styles.forecastDay, selectedDateIndex === index && styles.selectedDay]}>
                  {day}
                </Text>
                <PlaceholderIcon
                  code={fiveDayData.weatherCodes[index]}
                  style={styles.forecastIcon}
                />
                <Text style={styles.forecastTemp}>
                  {Math.round(fiveDayData.minTemps[index])}° - {Math.round(fiveDayData.maxTemps[index])}°
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.twentyFourHourForecast}>
          <Text style={styles.sectionTitle}>Dự báo 24 giờ</Text>
          {twentyFourHourData && twentyFourHourData.hours?.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: twentyFourHourData.hours,
                    datasets: [
                      {
                        data: twentyFourHourData.temps,
                        color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
                        strokeWidth: 2,
                      },
                    ],
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
                    style: { borderRadius: 16 },
                    propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa500' },
                    propsForLabels: { fontSize: 12 },
                  }}
                  bezier
                  style={styles.chart}
                />
                {twentyFourHourData.windSpeeds?.length > 0 && (
                  <View style={styles.windSpeedOverlay}>
                    <View style={styles.windSpeedRow}>
                      {twentyFourHourData.rawHours.map((hour: string, index: number) => (
                        <Text key={index} style={[styles.windSpeedText, { opacity: index % 3 === 0 ? 1 : 0 }]}>
                          {Math.round(twentyFourHourData.windSpeeds[index] || 0)} {settings.windUnit}
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
            <Text style={styles.infoValue}>{Math.round(twentyFourHourData?.uvIndices[0] || fiveDayData?.uvIndices[selectedDateIndex] || 0)}</Text>
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
            <Text style={styles.infoValue}>{formatSunsetTime(fiveDayData?.sunsets[selectedDateIndex] || '2025-05-20T18:09:00Z')}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>Áp suất</Text>
            <Text style={styles.infoValue}>{detailedWeather.hourly.pressure_msl?.[0] || 'N/A'} mb</Text>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailsContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cityName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
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
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeTab;