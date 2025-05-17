import { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, View, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { APP_COLOR } from '../../utils/constant';
import { City, WeatherData, HourlyForecast, DailyForecast } from '../../types/weather';
import CustomFlatList from '../../components/CustomFlatList/CustomFlatList';
import HourlyForecastItem from '../../components/HourlyForecastItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlaceholderIcon = ({ style }: { style?: object }) => (
  <View style={[{ width: 100, height: 100, backgroundColor: '#ccc', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }, style]}>
    <Text style={{ color: '#fff' }}>Icon</Text>
  </View>
);

const CityWeather = () => {
  const { city, weather, hourly, daily } = useLocalSearchParams();
  const [cityData, setCityData] = useState<City | null>(city ? JSON.parse(city as string) : null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(weather ? JSON.parse(weather as string) : null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>(hourly ? JSON.parse(hourly as string) : []);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>(daily ? JSON.parse(daily as string) : []);
  const [settings, setSettings] = useState<{ tempUnit: 'C' | 'F'; windUnit: 'kmh' | 'mph' }>({ tempUnit: 'C', windUnit: 'kmh' });
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    })();
  }, []);

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

  const convertTemperature = (temp: number, unit: 'C' | 'F') => {
    return unit === 'F' ? (temp * 9) / 5 + 32 : temp;
  };

  const convertWindSpeed = (speed: number, unit: 'kmh' | 'mph') => {
    return unit === 'mph' ? speed / 1.609 : speed;
  };

  if (!weatherData || !cityData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>
          Đang tải dữ liệu...
        </Text>
      </SafeAreaView>
    );
  }

  const WeatherIcon = getWeatherIconComponent(weatherData.hourly.weather_code?.[0], weatherData.hourly.is_day?.[0]);

  const renderHeader = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
      <View style={styles.weatherCard}>
        <Text style={styles.city}>{cityData.name}, {cityData.country}</Text>
        <WeatherIcon style={styles.weatherIcon} />
        <Text style={styles.temperature}>
          {convertTemperature(weatherData.hourly.temperature_2m[0], settings.tempUnit).toFixed(1)}°{settings.tempUnit}
        </Text>
        <Text style={styles.condition}>{weatherCodeToText(weatherData.hourly.weather_code?.[0])}</Text>
        <Text style={styles.location}>
          Vị trí: {cityData.latitude.toFixed(4)}, {cityData.longitude.toFixed(4)}
        </Text>
        <Text style={styles.details}>Độ ẩm: {weatherData.hourly.relative_humidity_2m?.[0]}%</Text>
        <Text style={styles.details}>
          Gió: {convertWindSpeed(weatherData.hourly.wind_speed_10m?.[0] ?? 0, settings.windUnit).toFixed(1)} {settings.windUnit}
        </Text>
        <Text style={styles.details}>Lượng mưa: {weatherData.hourly.precipitation?.[0]} mm</Text>
        <Text style={styles.details}>Chỉ số UV: {weatherData.hourly.uv_index?.[0] || 'N/A'}</Text>
      </View>
      <View style={styles.forecastSection}>
        <Text style={styles.sectionTitle}>Dự báo 12 giờ</Text>
        <CustomFlatList
          data={hourlyForecast}
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
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={weatherData.hourly.is_day?.[0] ? require('../../assets/background-day.png') : require('../../assets/background-night.png')}
        style={styles.background}
        defaultSource={require('../../assets/background-day.png')}
      >
        <CustomFlatList
          data={dailyForecast}
          keyExtractor={(item) => item.date}
          ListHeaderComponent={renderHeader()}
          renderItem={({ item }) => (
            <View style={styles.dailyItem}>
              <Text style={styles.dailyDate}>{new Date(item.date).toLocaleDateString('vi-VN')}</Text>
              <Text style={styles.dailyTemp}>
                {convertTemperature(item.temperature_max || 0, settings.tempUnit).toFixed(1)}°{settings.tempUnit} /{' '}
                {convertTemperature(item.temperature_min || 0, settings.tempUnit).toFixed(1)}°{settings.tempUnit}
              </Text>
              <Text style={styles.dailyCondition}>{weatherCodeToText(item.weather_code)}</Text>
            </View>
          )}
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
  },
  background: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  weatherCard: {
    backgroundColor: '#2A3550',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  city: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  weatherIcon: {
    marginBottom: 10,
  },
  temperature: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  condition: {
    fontSize: 20,
    color: '#fff',
  },
  location: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 10,
  },
  details: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 2,
  },
  forecastSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  dailyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  dailyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dailyTemp: {
    fontSize: 16,
    color: '#333',
  },
  dailyCondition: {
    fontSize: 14,
    color: '#666',
  },
  horizontalList: {
    marginBottom: 20,
  },
});

export default CityWeather;