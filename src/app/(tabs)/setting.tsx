import { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_COLOR } from '../../utils/constant';
import { scheduleNotifications } from '../../services/notifications';
import { getCurrentLocation, getCurrentWeather } from '../../services/weather';

const SettingPage = () => {
  const [notificationTimes, setNotificationTimes] = useState<string[]>(['06:00 AM', '04:00 PM']);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'kmh' | 'mph'>('kmh');

  useEffect(() => {
    (async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setNotificationTimes(settings.notificationTimes || ['06:00 AM', '04:00 PM']);
          setTempUnit(settings.tempUnit || 'C');
          setWindUnit(settings.windUnit || 'kmh');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    })();
  }, []);

  useEffect(() => {
    saveSettings();
  }, [notificationTimes, tempUnit, windUnit]);

  const convertTo24HourFormat = (time: string): string => {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const saveSettings = async () => {
    try {
      const settings = { notificationTimes, tempUnit, windUnit };
      await AsyncStorage.setItem('settings', JSON.stringify(settings));

      const loc = await getCurrentLocation();
      const weather = await getCurrentWeather({ latitude: loc.latitude, longitude: loc.longitude });
      const cityResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${loc.latitude}&longitude=${loc.longitude}`);
      const cityData = await cityResponse.json();
      const cityName = cityData.results?.[0]?.name || 'Vị trí hiện tại';

      if (notificationTimes.length > 0) {
        const convertedTimes = notificationTimes.map(time => convertTo24HourFormat(time));
        await scheduleNotifications({
          Location: { Name: cityName },
          Temperature: { Metric: { Value: weather.hourly.temperature_2m[0], Unit: tempUnit } },
          WeatherText: weatherCodeToText(weather.hourly.weather_code?.[0]),
          latitude: loc.latitude,
          longitude: loc.longitude,
          notificationTimes: convertedTimes, // Pass converted times
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const validateTime = (time: string): string => {
    const regex = /^([1-9]|1[0-2]):([0-5][0-9]) (AM|PM|am|pm)$/;
    if (regex.test(time)) {
      return time.toUpperCase();
    }
    alert('Thời gian không hợp lệ. Định dạng phải là HH:MM AM/PM (ví dụ: 06:30 AM). Đã đặt lại thành 12:00 AM.');
    return '12:00 AM';
  };

  const handleNotificationTimeChange = (value: string, index: number) => {
    const newTimes = [...notificationTimes];
    newTimes[index] = value;
    setNotificationTimes(newTimes);
  };

  const handleTimeBlur = (value: string, index: number) => {
    const validatedTime = validateTime(value.trim());
    if (validatedTime !== notificationTimes[index]) {
      const newTimes = [...notificationTimes];
      newTimes[index] = validatedTime;
      setNotificationTimes(newTimes);
    }
  };

  const addNotificationTime = () => {
    if (notificationTimes.length >= 4) {
      alert('Bạn chỉ có thể thêm tối đa 4 thời gian thông báo.');
      return;
    }
    setNotificationTimes([...notificationTimes, '12:00 AM']);
  };

  const removeNotificationTime = (index: number) => {
    if (notificationTimes.length <= 1) {
      alert('Bạn phải giữ ít nhất 1 thời gian thông báo.');
      return;
    }
    const newTimes = notificationTimes.filter((_, i) => i !== index);
    setNotificationTimes(newTimes);
  };

  const handleTempUnitChange = (value: 'C' | 'F') => {
    setTempUnit(value);
  };

  const handleWindUnitChange = (value: 'kmh' | 'mph') => {
    setWindUnit(value);
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient style={styles.gradient} colors={['#1F2A44', '#2A3550']} locations={[0, 0.8]}>
        <View style={styles.content}>
          <Text style={styles.heading}>Cài Đặt</Text>
          <View style={styles.settingItem}>
            <Text style={styles.label}>Thời gian thông báo (Tối đa 4)</Text>
            {notificationTimes.map((time, index) => (
              <View key={index} style={styles.notificationRow}>
                <TextInput
                  style={styles.timeInput}
                  placeholder="HH:MM AM/PM"
                  placeholderTextColor="#ccc"
                  value={time}
                  onChangeText={(value) => handleNotificationTimeChange(value, index)}
                  onBlur={() => handleTimeBlur(notificationTimes[index], index)}
                  keyboardType="default"
                />
                {notificationTimes.length > 1 && (
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeNotificationTime(index)}>
                    <Text style={styles.removeButtonText}>Xóa</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {notificationTimes.length < 4 && (
              <TouchableOpacity style={styles.addButton} onPress={addNotificationTime}>
                <Text style={styles.addButtonText}>Thêm thời gian</Text>
              </TouchableOpacity>
            )}
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
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
  timeInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: 120,
    color: '#000',
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