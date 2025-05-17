import { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, View, Switch, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_COLOR } from '../../utils/constant';
import { scheduleNotifications } from '../../services/notifications';
import { getCurrentLocation, getCurrentWeather } from '../../services/weather';

const SettingPage = () => {
  const [notificationTimes, setNotificationTimes] = useState<string[]>(['06:00', '16:00']);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'kmh' | 'mph'>('kmh');
  const [uvNotifications, setUvNotifications] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setNotificationTimes(settings.notificationTimes || ['06:00', '16:00']);
          setTempUnit(settings.tempUnit || 'C');
          setWindUnit(settings.windUnit || 'kmh');
          setUvNotifications(settings.uvNotifications !== undefined ? settings.uvNotifications : true);
        }

        const loc = await getCurrentLocation();
        const weather = await getCurrentWeather({ latitude: loc.latitude, longitude: loc.longitude });
        const cityResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${loc.latitude}&longitude=${loc.longitude}`);
        const cityData = await cityResponse.json();
        const cityName = cityData.results?.[0]?.name || 'Vị trí hiện tại';

        await scheduleNotifications({
          Location: { Name: cityName },
          Temperature: { Metric: { Value: weather.hourly.temperature_2m[0], Unit: tempUnit } },
          WeatherText: weatherCodeToText(weather.hourly.weather_code?.[0]),
          UVIndex: weather.hourly.uv_index?.[0] || 0,
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    })();
  }, [tempUnit]);

  const saveSettings = async () => {
    try {
      const settings = { notificationTimes, tempUnit, windUnit, uvNotifications };
      await AsyncStorage.setItem('settings', JSON.stringify(settings));

      const loc = await getCurrentLocation();
      const weather = await getCurrentWeather({ latitude: loc.latitude, longitude: loc.longitude });
      const cityResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${loc.latitude}&longitude=${loc.longitude}`);
      const cityData = await cityResponse.json();
      const cityName = cityData.results?.[0]?.name || 'Vị trí hiện tại';

      await scheduleNotifications({
        Location: { Name: cityName },
        Temperature: { Metric: { Value: weather.hourly.temperature_2m[0], Unit: tempUnit } },
        WeatherText: weatherCodeToText(weather.hourly.weather_code?.[0]),
        UVIndex: weather.hourly.uv_index?.[0] || 0,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleNotificationTimeChange = (value: string, index: number) => {
    const newTimes = [...notificationTimes];
    newTimes[index] = value;
    setNotificationTimes(newTimes);
    saveSettings();
  };

  const addNotificationTime = () => {
    setNotificationTimes([...notificationTimes, '12:00']);
    saveSettings();
  };

  const removeNotificationTime = (index: number) => {
    const newTimes = notificationTimes.filter((_, i) => i !== index);
    setNotificationTimes(newTimes);
    saveSettings();
  };

  const handleTempUnitChange = (value: 'C' | 'F') => {
    setTempUnit(value);
    saveSettings();
  };

  const handleWindUnitChange = (value: 'kmh' | 'mph') => {
    setWindUnit(value);
    saveSettings();
  };

  const handleUvNotificationsChange = (value: boolean) => {
    setUvNotifications(value);
    saveSettings();
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient style={styles.gradient} colors={['#1F2A44', '#2A3550']} locations={[0, 0.8]}>
        <View style={styles.content}>
          <Text style={styles.heading}>Cài Đặt</Text>
          <View style={styles.settingItem}>
            <Text style={styles.label}>Thời gian thông báo</Text>
            {notificationTimes.map((time, index) => (
              <View key={index} style={styles.notificationRow}>
                <Picker
                  selectedValue={time}
                  onValueChange={(value) => handleNotificationTimeChange(value, index)}
                  style={styles.picker}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0') + ':00';
                    return <Picker.Item key={hour} label={hour} value={hour} />;
                  })}
                </Picker>
                {notificationTimes.length > 1 && (
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeNotificationTime(index)}>
                    <Text style={styles.removeButtonText}>Xóa</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addNotificationTime}>
              <Text style={styles.addButtonText}>Thêm thời gian</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.label}>Đơn vị nhiệt độ</Text>
            <Picker
              selectedValue={tempUnit}
              onValueChange={handleTempUnitChange}
              style={styles.picker}
            >
              <Picker.Item label="Celsius (°C)" value="C" />
              <Picker.Item label="Fahrenheit (°F)" value="F" />
            </Picker>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.label}>Đơn vị tốc độ gió</Text>
            <Picker
              selectedValue={windUnit}
              onValueChange={handleWindUnitChange}
              style={styles.picker}
            >
              <Picker.Item label="km/h" value="kmh" />
              <Picker.Item label="mph" value="mph" />
            </Picker>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.label}>Thông báo chỉ số UV</Text>
            <Switch
              value={uvNotifications}
              onValueChange={handleUvNotificationsChange}
              trackColor={{ false: '#767577', true: APP_COLOR.Default }}
              thumbColor={uvNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  heading: {
    fontWeight: '700',
    fontSize: 30,
    color: '#fff',
    marginBottom: 20,
  },
  settingItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 50,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingPage;