import { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_COLOR } from '../../utils/constant';

const SettingPage = () => {
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'kmh' | 'mph'>('kmh');

  useEffect(() => {
    (async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setNotificationTime(settings.notificationTime || '08:00');
          setTempUnit(settings.tempUnit || 'C');
          setWindUnit(settings.windUnit || 'kmh');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    })();
  }, []);

  const saveSettings = async () => {
    try {
      const settings = { notificationTime, tempUnit, windUnit };
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleNotificationTimeChange = (value: string) => {
    setNotificationTime(value);
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient style={styles.gradient} colors={['#1F2A44', '#2A3550']} locations={[0, 0.8]}>
        <View style={styles.content}>
          <Text style={styles.heading}>Cài Đặt</Text>
          <View style={styles.settingItem}>
            <Text style={styles.label}>Thời gian thông báo</Text>
            <Picker
              selectedValue={notificationTime}
              onValueChange={handleNotificationTimeChange}
              style={styles.picker}
            >
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0') + ':00';
                return <Picker.Item key={hour} label={hour} value={hour} />;
              })}
            </Picker>
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
});

export default SettingPage;