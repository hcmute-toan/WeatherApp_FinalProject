import AsyncStorage from '@react-native-async-storage/async-storage';

export const getSettings = async () => {
  try {
    const savedSettings = await AsyncStorage.getItem('settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Lỗi khi lấy cài đặt:', error);
  }
  return {
    notificationTimes: ['06:00', '16:00'],
    tempUnit: 'C',
    windUnit: 'kmh',
    uvNotifications: true,
  };
};

export const getFavorites = async () => {
  try {
    const savedFavorites = await AsyncStorage.getItem('favorites');
    if (savedFavorites) {
      return JSON.parse(savedFavorites);
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu thích:', error);
  }
  return [];
};

export const saveFavorites = async (favorites: { city: string; latitude: number; longitude: number; isDefault: boolean }[]) => {
  try {
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Lỗi khi lưu danh sách yêu thích:', error);
  }
};

export const getDefaultLocation = async () => {
  try {
    const defaultLocation = await AsyncStorage.getItem('defaultLocation');
    if (defaultLocation) {
      return JSON.parse(defaultLocation);
    }
  } catch (error) {
    console.error('Lỗi khi lấy vị trí mặc định:', error);
  }
  return null;
};

export const saveDefaultLocation = async (location: { city: string; latitude: number; longitude: number }) => {
  try {
    await AsyncStorage.setItem('defaultLocation', JSON.stringify(location));
  } catch (error) {
    console.error('Lỗi khi lưu vị trí mặc định:', error);
  }
};