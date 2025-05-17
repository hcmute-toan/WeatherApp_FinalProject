import AsyncStorage from '@react-native-async-storage/async-storage';

export const getSettings = async () => {
  try {
    const savedSettings = await AsyncStorage.getItem('settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return {
    notificationTimes: ['06:00', '16:00'],
    tempUnit: 'C',
    windUnit: 'kmh',
    uvNotifications: true,
  };
};