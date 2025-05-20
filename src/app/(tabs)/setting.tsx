import { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_COLOR } from '../../utils/constant';
import { scheduleNotifications } from '../../services/notifications';
import { getCurrentLocation, getCurrentWeather } from '../../services/weather';

interface NotificationTime {
  hours: string; // 1–12 or empty
  minutes: string; // 00–59 or empty
  period: 'AM' | 'PM';
}

const SettingPage = () => {
  const [notificationTimes, setNotificationTimes] = useState<NotificationTime[]>([
    { hours: '06', minutes: '00', period: 'AM' },
    { hours: '04', minutes: '00', period: 'PM' },
  ]);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'kmh' | 'mph'>('kmh');
  const [newTime, setNewTime] = useState<NotificationTime>({ hours: '', minutes: '', period: 'AM' });
  const [fadeAnim] = useState(new Animated.Value(0)); // For fade-in animation

  useEffect(() => {
    // Fade-in animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    (async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          const times = (settings.notificationTimes || ['06:00 AM', '04:00 PM']).map((time: string) => {
            const [timePart, period] = time.split(' ');
            const [hours, minutes] = timePart.split(':').map((val: string) => val.padStart(2, '0'));
            return { hours, minutes, period: period.toUpperCase() as 'AM' | 'PM' };
          });
          setNotificationTimes(times);
          setTempUnit(settings.tempUnit || 'C');
          setWindUnit(settings.windUnit || 'kmh');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    })();
  }, []);

  const convertTo24HourFormat = ({ hours, minutes, period }: NotificationTime): string => {
    if (!hours || !minutes || !period) {
      throw new Error('Hours, minutes, and period are required');
    }
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    if (isNaN(h) || isNaN(m) || h < 1 || h > 12 || m < 0 || m > 59) {
      throw new Error('Invalid time format');
    }
    let hours24 = h;
    if (period === 'PM' && h !== 12) {
      hours24 += 12;
    } else if (period === 'AM' && h === 12) {
      hours24 = 0;
    }
    return `${hours24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const convertTemperature = (temp: number, unit: 'C' | 'F') => {
    if (typeof temp !== 'number' || isNaN(temp)) return 0;
    return Math.round(unit === 'F' ? (temp * 9) / 5 + 32 : temp);
  };

  const saveSettings = async (showAlert: boolean = true) => {
    try {
      for (const time of notificationTimes) {
        if (!time.hours || !time.minutes || !time.period) {
          alert('Vui lòng nhập đầy đủ giờ, phút và AM/PM cho tất cả thời gian thông báo.');
          return;
        }
        const h = parseInt(time.hours, 10);
        const m = parseInt(time.minutes, 10);
        if (isNaN(h) || isNaN(m) || h < 1 || h > 12 || m < 0 || m > 59) {
          alert(`Thời gian không hợp lệ: ${time.hours}:${time.minutes} ${time.period}`);
          return;
        }
      }

      const timesAsStrings = notificationTimes.map(({ hours, minutes, period }) =>
        `${hours}:${minutes} ${period}`
      );
      const settings = { notificationTimes: timesAsStrings, tempUnit, windUnit };
      await AsyncStorage.setItem('settings', JSON.stringify(settings));

      const defaultLocation = await AsyncStorage.getItem('defaultLocation');
      let loc: { city: string; latitude: number; longitude: number };
      if (defaultLocation) {
        loc = JSON.parse(defaultLocation);
      } else {
        const currentLocation = await getCurrentLocation();
        loc = {
          city: 'Vị trí hiện tại',
          ...currentLocation,
        };
      }

      const weather = await getCurrentWeather({ latitude: loc.latitude, longitude: loc.longitude });

      if (notificationTimes.length > 0) {
        const convertedTimes = notificationTimes.map(time => convertTo24HourFormat(time));
        await scheduleNotifications({
          Location: { Name: loc.city },
          Temperature: {
            Metric: {
              Value: convertTemperature(weather.hourly.temperature_2m[0], tempUnit),
              Unit: tempUnit,
            },
          },
          WeatherText: weatherCodeToText(weather.hourly.weather_code?.[0]),
          latitude: loc.latitude,
          longitude: loc.longitude,
          notificationTimes: convertedTimes,
        });
      }
      if (showAlert) {
        alert('Cài đặt đã được lưu thành công.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Lỗi khi lưu cài đặt: ${error instanceof Error ? error.message : 'Không xác định'}`);
    }
  };

  const validateHours = (value: string): string => {
    if (!value) return '';
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > 12) {
      return '12';
    }
    return num.toString().padStart(2, '0');
  };

  const validateMinutes = (value: string): string => {
    if (!value) return '';
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > 59) {
      return '00';
    }
    return num.toString().padStart(2, '0');
  };

  const handleNotificationTimeChange = (
    field: 'hours' | 'minutes' | 'period',
    value: string,
    index: number
  ) => {
    const newTimes = [...notificationTimes];
    if (field === 'hours') {
      newTimes[index].hours = value;
    } else if (field === 'minutes') {
      newTimes[index].minutes = value;
    } else {
      newTimes[index].period = value as 'AM' | 'PM';
    }
    setNotificationTimes(newTimes);
  };

  const handleTimeBlur = (field: 'hours' | 'minutes', value: string, index: number) => {
    const newTimes = [...notificationTimes];
    const originalTime = { ...notificationTimes[index] };
    if (field === 'hours') {
      newTimes[index].hours = validateHours(value);
    } else {
      newTimes[index].minutes = validateMinutes(value);
    }
    setNotificationTimes(newTimes);
    // Check if the time was changed
    if (
      originalTime.hours !== newTimes[index].hours ||
      originalTime.minutes !== newTimes[index].minutes
    ) {
      saveSettings(true); // Trigger save with alert
    }
  };

  const handlePeriodChange = (value: 'AM' | 'PM', index: number) => {
    const newTimes = [...notificationTimes];
    const originalPeriod = newTimes[index].period;
    newTimes[index].period = value;
    setNotificationTimes(newTimes);
    if (originalPeriod !== value) {
      saveSettings(true); // Trigger save with alert
    }
  };

  const addNotificationTime = () => {
    if (notificationTimes.length >= 4) {
      alert('Bạn chỉ có thể thêm tối đa 4 thời gian thông báo.');
      return;
    }
    const { hours, minutes, period } = newTime;
    if (!hours || !minutes || !period) {
      alert('Vui lòng nhập đầy đủ giờ, phút và AM/PM.');
      return;
    }
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    if (isNaN(h) || isNaN(m) || h < 1 || h > 12 || m < 0 || m > 59) {
      alert('Thời gian không hợp lệ. Giờ phải từ 1-12, phút từ 0-59.');
      return;
    }

    const newTimes = [...notificationTimes, { hours, minutes, period }];
    setNotificationTimes(newTimes);
    setNewTime({ hours: '', minutes: '', period: 'AM' });
    saveSettings(); // Save with alert
  };

  const removeNotificationTime = (index: number) => {
    if (notificationTimes.length <= 1) {
      alert('Bạn phải giữ ít nhất 1 thời gian thông báo.');
      return;
    }
    const newTimes = notificationTimes.filter((_, i) => i !== index);
    setNotificationTimes(newTimes);
    saveSettings(true); // Save with alert
  };

  const handleTempUnitChange = (value: 'C' | 'F') => {
    setTempUnit(value);
    saveSettings(true); // Save with alert
  };

  const handleWindUnitChange = (value: 'kmh' | 'mph') => {
    setWindUnit(value);
    saveSettings(true); // Save with alert
  };

  const handleNewTimeChange = (field: 'hours' | 'minutes' | 'period', value: string) => {
    const updatedTime = { ...newTime };
    if (field === 'hours') {
      updatedTime.hours = value;
    } else if (field === 'minutes') {
      updatedTime.minutes = value;
    } else {
      updatedTime.period = value as 'AM' | 'PM';
    }
    setNewTime(updatedTime);
  };

  const handleNewTimeBlur = (field: 'hours' | 'minutes', value: string) => {
    const updatedTime = { ...newTime };
    if (field === 'hours') {
      updatedTime.hours = validateHours(value);
    } else {
      updatedTime.minutes = validateMinutes(value);
    }
    setNewTime(updatedTime);
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
      <LinearGradient style={styles.gradient} colors={['#1E3A8A', '#3B82F6']} locations={[0, 1]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <Text style={styles.heading}>Cài Đặt Thời Tiết</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Thời gian thông báo (Tối đa 4)</Text>
              {notificationTimes.map((time, index) => (
                <View key={index} style={styles.notificationRow}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="Giờ (1–12)"
                    placeholderTextColor="#9CA3AF"
                    value={time.hours}
                    onChangeText={(value) => handleNotificationTimeChange('hours', value, index)}
                    onBlur={() => handleTimeBlur('hours', time.hours, index)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.colon}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="Phút (00–59)"
                    placeholderTextColor="#9CA3AF"
                    value={time.minutes}
                    onChangeText={(value) => handleNotificationTimeChange('minutes', value, index)}
                    onBlur={() => handleTimeBlur('minutes', time.minutes, index)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Picker
                    selectedValue={time.period}
                    onValueChange={(value) => handlePeriodChange(value, index)}
                    style={styles.periodPicker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="AM" value="AM" />
                    <Picker.Item label="PM" value="PM" />
                  </Picker>
                  {notificationTimes.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeNotificationTime(index)}
                    >
                      <Text style={styles.removeButtonText}>Xóa</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <View style={styles.newTimeRow}>
                <TextInput
                  style={styles.timeInput}
                  placeholder="Giờ (1–12)"
                  placeholderTextColor="#9CA3AF"
                  value={newTime.hours}
                  onChangeText={(value) => handleNewTimeChange('hours', value)}
                  onBlur={() => handleNewTimeBlur('hours', newTime.hours)}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.colon}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="Phút (00–59)"
                  placeholderTextColor="#9CA3AF"
                  value={newTime.minutes}
                  onChangeText={(value) => handleNewTimeChange('minutes', value)}
                  onBlur={() => handleNewTimeBlur('minutes', newTime.minutes)}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Picker
                  selectedValue={newTime.period}
                  onValueChange={(value) => handleNewTimeChange('period', value)}
                  style={styles.periodPicker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="AM" value="AM" />
                  <Picker.Item label="PM" value="PM" />
                </Picker>
                <TouchableOpacity
                  style={[styles.addButton, notificationTimes.length >= 4 && styles.disabledButton]}
                  onPress={addNotificationTime}
                  disabled={notificationTimes.length >= 4}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Đơn vị nhiệt độ</Text>
              <Picker
                selectedValue={tempUnit}
                onValueChange={handleTempUnitChange}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Celsius (°C)" value="C" />
                <Picker.Item label="Fahrenheit (°F)" value="F" />
              </Picker>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Đơn vị tốc độ gió</Text>
              <Picker
                selectedValue={windUnit}
                onValueChange={handleWindUnitChange}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="km/h" value="kmh" />
                <Picker.Item label="mph" value="mph" />
              </Picker>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={() => saveSettings(true)}>
              <Text style={styles.saveButtonText}>Lưu Cài Đặt</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  content: {
    flexGrow: 1,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  picker: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerItem: {
    fontSize: 16,
    color: '#1F2937',
  },
  periodPicker: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    width: 100,
    height: 50,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  newTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  timeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    width: 80,
    color: '#1F2937',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
  },
  colon: {
    color: '#FFFFFF',
    fontSize: 18,
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingPage;