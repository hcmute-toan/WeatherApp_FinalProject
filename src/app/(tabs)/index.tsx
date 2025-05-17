import { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, View, ImageBackground, TouchableOpacity } from 'react-native';
import { APP_COLOR } from '../../utils/constant';
import { getCurrentWeather, getCurrentLocation, getHourlyForecast, getDailyForecast } from '../../services/weather';
import { WeatherData, HourlyForecast, DailyForecast } from '../../types/weather';
import CustomFlatList from '../../components/CustomFlatList/CustomFlatList';
import HourlyForecastItem from '../../components/HourlyForecastItem';
import { scheduleNotifications } from '../../services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PlaceholderIcon = ({ style }: { style?: object }) => (
  <View style={[{ width: 100, height: 100, backgroundColor: '#ccc', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }, style]}>
    <Text style={{ color: '#fff' }}>☁</Text>
  </View>
);

const HomeTab = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; city?: string } | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [settings, setSettings] = useState<{ tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph' }>({ tempUnit: 'C', windUnit: 'kmh' });

  useEffect(() => {
    (async () => {
      try {
        const loc = await getCurrentLocation();
        const cityResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${loc.latitude}&longitude=${loc.longitude}`);
        const cityData = await cityResponse.json();
        const cityName = cityData.results?.[0]?.name || 'Vị trí hiện tại';
        setLocation({ ...loc, city: cityName });

        const [weatherData, hourlyData, dailyData] = await Promise.all([
          getCurrentWeather({ latitude: loc.latitude, longitude: loc.longitude }),
          getHourlyForecast({ latitude: loc.latitude, longitude: loc.longitude }),
          getDailyForecast({ latitude: loc.latitude, longitude: loc.longitude }),
        ]);
        setWeather(weatherData);
        setHourlyForecast(hourlyData);
        setDailyForecast(dailyData);

        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }

        await scheduleNotifications({
          Location: { Name: cityName },
          Temperature: { Metric: { Value: weatherData.hourly.temperature_2m[0], Unit: settings.tempUnit } },
          WeatherText: weatherCodeToText(weatherData.hourly.weather_code?.[0]),
        });
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thời tiết:', error);
        const data = await getCurrentWeather();
        setWeather(data);
        setLocation({ latitude: 16.1667, longitude: 107.8333, city: 'Huế' });
        setHourlyForecast([]);
        setDailyForecast([]);
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

  const getWeatherIconComponent = (code: number | undefined, isDay?: number) => {
    // For daily forecasts, assume daytime if isDay is undefined
    const isDaytime = isDay !== undefined ? isDay : 1;
    return PlaceholderIcon; // In a real app, this would return a specific icon based on code and isDaytime
  };

  const convertTemperature = (temp: number, unit: 'C' | 'F') => {
    return unit === 'F' ? (temp * 9) / 5 + 32 : temp;
  };

  const convertWindSpeed = (speed: number, unit: 'kmh' | 'mph') => {
    return unit === 'mph' ? speed / 1.609 : speed;
  };

  if (!weather || !location) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  const WeatherIcon = getWeatherIconComponent(weather.hourly.weather_code?.[0], weather.hourly.is_day?.[0]);
  const currentDate = new Date().toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={20} color="#fff" />
          <Text style={styles.locationText}>{location.city}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.dateText}>{currentDate}</Text>
      <View style={styles.weatherCard}>
        <WeatherIcon style={styles.weatherIcon} />
        <Text style={styles.temperature}>
          {convertTemperature(weather.hourly.temperature_2m[0], settings.tempUnit).toFixed(1)}°{settings.tempUnit}
        </Text>
        <Text style={styles.condition}>{weatherCodeToText(weather.hourly.weather_code?.[0])}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailItem}>Độ ẩm: {weather.hourly.relative_humidity_2m?.[0]}%</Text>
        <Text style={styles.detailItem}>
          Gió: {convertWindSpeed(weather.hourly.wind_speed_10m?.[0] || 0, settings.windUnit).toFixed(1)} {settings.windUnit}
        </Text>
        <Text style={styles.detailItem}>Chỉ số UV: {weather.hourly.uv_index?.[0] || 'N/A'}</Text>
      </View>
      <View style={styles.forecastSection}>
        <Text style={styles.sectionTitle}>Dự báo theo giờ</Text>
        <CustomFlatList
          data={hourlyForecast.slice(0, 12)}
          horizontal
          keyExtractor={(item) => item.time}
          renderItem={({ item }) => (
            <HourlyForecastItem
              forecast={{ ...item, temperature: convertTemperature(item.temperature || 0, settings.tempUnit), unit: settings.tempUnit }}
            />
          )}
          style={styles.horizontalList}
        />
      </View>
      <View style={styles.forecastSection}>
        <Text style={styles.sectionTitle}>Dự báo 5 ngày</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={weather.hourly.is_day?.[0] ? require('../../assets/background-day.png') : require('../../assets/background-night.png')}
        style={styles.background}
        defaultSource={require('../../assets/background-day.png')}
      >
        <CustomFlatList
          data={dailyForecast.slice(0, 5)}
          keyExtractor={(item) => item.date}
          ListHeaderComponent={renderHeader()}
          renderItem={({ item }) => {
            const date = new Date(item.date);
            const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
            const WeatherIconSmall = getWeatherIconComponent(item.weather_code); // Removed item.is_day
            return (
              <View style={styles.dailyItem}>
                <Text style={styles.dailyDate}>{dayName}</Text>
                <WeatherIconSmall style={styles.dailyIcon} />
                <Text style={styles.dailyTemp}>
                  {convertTemperature(item.temperature_max || 0, settings.tempUnit).toFixed(1)}° / {convertTemperature(item.temperature_min || 0, settings.tempUnit).toFixed(1)}°
                </Text>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2A44',
    paddingTop: 20,
  },
  background: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 20,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIcon: {
    marginBottom: 10,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  condition: {
    fontSize: 18,
    color: '#fff',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  detailItem: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 5,
  },
  forecastSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  dailyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  dailyIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 10,
  },
  dailyTemp: {
    fontSize: 16,
    color: '#333',
  },
  horizontalList: {
    marginBottom: 20,
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default HomeTab;