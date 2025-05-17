import React from 'react';
import { View, Text, Image } from 'react-native';
import { HourlyForecast } from '../types/weather';

interface HourlyForecastItemProps {
  forecast: HourlyForecast;
}

const HourlyForecastItem: React.FC<HourlyForecastItemProps> = ({ forecast }) => {
  const time = new Date(forecast.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 15 }}>
      <Text style={{ fontSize: 14, color: '#333' }}>{time}</Text>
      <Image
        source={{ uri: `../assets/icons/${forecast.weather_code || 0}.png` }}
        style={{ width: 30, height: 30, marginVertical: 5 }}
      />
      <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>
        {forecast.temperature || 0}°C
      </Text>
    </View>
  );
};

export default HourlyForecastItem;