import * as Notifications from 'expo-notifications';
import { getSettings } from '../utils/storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleNotifications = async (weather: { Location: { Name: string }; Temperature: { Metric: { Value: number; Unit: string } }; WeatherText: string }) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const settings = await getSettings();

  const suggestions = generateSuggestions(weather.Temperature.Metric.Value, 0);
  for (const time of settings.notificationTimes) {
    const [hour, minute] = time.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Cập nhật thời tiết cho ${weather.Location.Name}`,
        body: `${weather.WeatherText}. Nhiệt độ: ${weather.Temperature.Metric.Value}°${weather.Temperature.Metric.Unit}. ${suggestions.join(' ')}`,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }
};

const generateSuggestions = (temp: number, precip: number): string[] => {
  const suggestions = [];
  if (temp < 15) suggestions.push('Mặc áo khoác.');
  if (temp > 25) suggestions.push('Uống đủ nước.');
  if (precip > 0.1) suggestions.push('Mang ô đi mưa.');
  return suggestions;
};