import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface WeatherData {
  Location: { Name: string };
  Temperature: { Metric: { Value: number; Unit: string } };
  WeatherText: string;
  latitude: number;
  longitude: number;
  notificationTimes?: string[]; // Array of times in "HH:MM" (24-hour) format
}

export const scheduleNotifications = async (weather: WeatherData) => {
  // Cancel all existing notifications to prevent duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { Location, Temperature, WeatherText, notificationTimes } = weather;

  if (!notificationTimes || notificationTimes.length === 0) {
    console.log('No notification times provided');
    return;
  }

  const suggestions = generateSuggestions(Temperature.Metric.Value, WeatherText);
  const title = `Cập nhật thời tiết cho ${Location.Name}`;
  const body = `${WeatherText}. Nhiệt độ: ${Math.round(Temperature.Metric.Value)}°${Temperature.Metric.Unit}. ${suggestions.join(' ')}`;

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();
  const currentMilliseconds = now.getMilliseconds();

  const uniqueTimes = [...new Set(notificationTimes)]; // Remove duplicates

  for (const time of uniqueTimes) {
    const [hour, minute] = time.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      console.error(`Invalid time format: ${time}`);
      continue;
    }

    // Calculate the time difference in seconds
    const nowInSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds + currentMilliseconds / 1000;
    const targetInSeconds = hour * 3600 + minute * 60;

    let secondsUntilTrigger = targetInSeconds - nowInSeconds;
    if (secondsUntilTrigger <= 0) {
      // If the time has already passed today, schedule for tomorrow
      secondsUntilTrigger += 24 * 3600; // Add 24 hours in seconds
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: {
        seconds: Math.max(1, secondsUntilTrigger), // Minimum 1 second to avoid immediate trigger
        repeats: false, // Ensure one-time notification
        channelId: 'weather-updates',
      },
    });

    console.log(`Scheduled one-time notification at ${time} (in ${Math.max(1, secondsUntilTrigger)} seconds from now)`);
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

const generateSuggestions = (temp: number, weatherText: string): string[] => {
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
  return suggestions.length > 0 ? suggestions : ['Thời tiết bình thường, hãy tận hưởng ngày mới!'];
};