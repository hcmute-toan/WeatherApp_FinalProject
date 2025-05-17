import * as Notifications from 'expo-notifications';
import { getSettings } from '../utils/storage';

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
}) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const settings = await getSettings();

  const suggestions = generateSuggestions(weather.Temperature.Metric.Value, weather.UVIndex || 0, weather.WeatherText);
  for (const time of settings.notificationTimes) {
    const [hour, minute] = time.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Cập nhật thời tiết cho ${weather.Location.Name}`,
        body: `${weather.WeatherText}. Nhiệt độ: ${weather.Temperature.Metric.Value}°${weather.Temperature.Metric.Unit}. ${
          settings.uvNotifications && weather.UVIndex ? `Chỉ số UV: ${weather.UVIndex}. ` : ''
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

const generateSuggestions = (temp: number, uvIndex: number, weatherText: string): string[] => {
  const suggestions = [];
  if (temp < 15) suggestions.push('Mặc áo khoác để giữ ấm.');
  if (temp > 30) suggestions.push('Uống đủ nước và tránh nắng nóng.');
  if (weatherText.includes('Mưa') || weatherText.includes('Dông')) suggestions.push('Mang ô hoặc áo mưa.');
  if (uvIndex > 5) suggestions.push('Sử dụng kem chống nắng để bảo vệ da.');
  return suggestions;
};