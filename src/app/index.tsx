import { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, View, ImageBackground } from 'react-native';
import { APP_COLOR } from '../utils/constant';
import { getCurrentWeather, getCurrentLocation } from '../services/weather';
import { WeatherData } from '../types/weather';

const PlaceholderIcon = ({ style }: { style?: object }) => (
  <View style={[{ width: 100, height: 100, backgroundColor: '#ccc', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }, style]}>
    <Text style={{ color: '#fff' }}>Icon</Text>
  </View>
);

const HomeTab = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const loc = await getCurrentLocation();
        setLocation(loc);
        const data = await getCurrentWeather({ latitude: loc.latitude, longitude: loc.longitude });
        setWeather(data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thời tiết:', error);
        const data = await getCurrentWeather();
        setWeather(data);
        setLocation({ latitude: 16.1667, longitude: 107.8333 });
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

  if (!weather || !location) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>
          Đang tải dữ liệu...
        </Text>
      </SafeAreaView>
    );
  }

  const WeatherIcon = getWeatherIconComponent(weather.hourly.weather_code?.[0], weather.hourly.is_day?.[0]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={weather.hourly.is_day?.[0] ? require('../assets/background-day.png') : require('../assets/background-night.png')}
        style={styles.background}
        defaultSource={require('../assets/background-day.png')}
      >
        <View style={styles.weatherCard}>
          <WeatherIcon style={styles.weatherIcon} />
          <Text style={styles.temperature}>{weather.hourly.temperature_2m[0]}°C</Text>
          <Text style={styles.condition}>{weatherCodeToText(weather.hourly.weather_code?.[0])}</Text>
          <Text style={styles.location}>
            Vị trí: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
          <Text style={styles.details}>Độ ẩm: {weather.hourly.relative_humidity_2m?.[0]}%</Text>
          <Text style={styles.details}>Gió: {weather.hourly.wind_speed_10m?.[0]} km/h</Text>
          <Text style={styles.details}>Lượng mưa: {weather.hourly.precipitation?.[0]} mm</Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default HomeTab;