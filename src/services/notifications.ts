import * as Notifications from 'expo-notifications';
import { getSettings } from '../utils/storage';
import { getCurrentWeather } from './weather';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleNotifications = async (weather: {
  Location: { Name: string };
  Temperature: { Metric: { Value: number; Unit: string } };
  WeatherText: string;
  UVIndex?: number;
  latitude: number;
  longitude: number;
}) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const settings = await getSettings();

  for (const time of settings.notificationTimes) {
    const [hour, minute] = time.split(':').map(Number);
    
    // Fetch forecast data for the next 3 hours from the notification time
    const now = new Date();
    const forecastTime = new Date(now);
    forecastTime.setHours(hour, minute, 0, 0);
    const hoursUntilNotification = (forecastTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const forecastIndex = Math.max(0, Math.round(hoursUntilNotification));

    // Fetch weather forecast for the location
    const forecast = await getCurrentWeather({ latitude: weather.latitude, longitude: weather.longitude });
    
    // Get weather data for the approximate time of the notification
    const forecastTemp = forecast.hourly.temperature_2m[forecastIndex] || weather.Temperature.Metric.Value;
    const forecastWeatherCode = forecast.hourly.weather_code?.[forecastIndex] || 0;
    const forecastUVIndex = forecast.hourly.uv_index?.[forecastIndex] || weather.UVIndex || 0;
    const forecastWeatherText = weatherCodeToText(forecastWeatherCode);

    const suggestions = generateSuggestions(forecastTemp, forecastUVIndex, forecastWeatherText);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Cập nhật thời tiết cho ${weather.Location.Name}`,
        body: `${forecastWeatherText}. Nhiệt độ: ${forecastTemp}°${settings.tempUnit}. ${
          settings.uvNotifications && forecastUVIndex ? `Chỉ số UV: ${forecastUVIndex}. ` : ''
        }${suggestions.join(' ')}`,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }
};

const weatherCodeToText = (code: number): string => {
  const weatherCodes: { [key: number]: string } = {
    0: 'Trời quang', 1: 'Gần như quang đãng', 2: 'Có mây rải rác', 3: 'Nhiều mây',
    45: 'Sương mù', 48: 'Sương mù có băng giá', 51: 'Mưa phùn nhẹ', 53: 'Mưa phùn vừa',
    55: 'Mưa phùn dày', 61: 'Mưa nhẹ', 63: 'Mưa vừa', 65: 'Mưa to',
    80: 'Mưa rào nhẹ', 81: 'Mưa rào vừa', 82: 'Mưa rào mạnh',
    95: 'Dông bão', 96: 'Dông bão kèm mưa đá nhẹ', 99: 'Dông bão kèm mưa đá lớn',
  };
  return weatherCodes[code] || 'Không xác định';
};

const generateSuggestions = (temp: number, uvIndex: number, weatherText: string): string[] => {
  const suggestions = [];
  if (weatherText.includes('Mưa') || weatherText.includes('Dông')) {
    suggestions.push('Mang ô hoặc áo mưa.');
  }
  if (temp < 15) {
    suggestions.push('Mặc áo khoác để giữ ấm.');
  }
  if (temp > 30 && (weatherText.includes('Trời quang') || weatherText.includes('Có mây'))) {
    suggestions.push('Mặc áo chống nắng và đội mũ.');
  }
  if (uvIndex > 5) {
    suggestions.push('Sử dụng kem chống nắng để bảo vệ da.');
  }
  return suggestions.length > 0 ? suggestions : ['Thời tiết bình thường, hãy tận hưởng ngày mới!'];
};