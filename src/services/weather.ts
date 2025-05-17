import axios from 'axios';
import * as Location from 'expo-location';
import { WeatherData, HourlyForecast, DailyForecast, City } from '../types/weather';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface WeatherParams {
  latitude?: number;
  longitude?: number;
  hourly?: string;
  daily?: string;
  timezone?: string;
  forecast_days?: number;
  past_days?: number;
}

export const getCurrentWeather = async (params: WeatherParams = {}): Promise<WeatherData> => {
  const defaultParams = {
    latitude: params.latitude || 16.1667,
    longitude: params.longitude || 107.8333,
    hourly: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,wind_gusts_10m_max',
    timezone: params.timezone || 'auto',
    forecast_days: params.forecast_days || 7,
    past_days: params.past_days || 0,
  };

  const query = new URLSearchParams({
    ...defaultParams,
    hourly: defaultParams.hourly,
    daily: defaultParams.daily,
  } as any).toString();

  const response = await axios.get(`${BASE_URL}?${query}`);
  return response.data;
};

export const getHourlyForecast = async (params: WeatherParams = {}): Promise<HourlyForecast[]> => {
  const data = await getCurrentWeather(params);
  const indices = Array.from({ length: 24 }, (_, i) => i); // Next 24 hours
  return indices.map((i) => ({
    time: data.hourly.time[i],
    temperature: data.hourly.temperature_2m?.[i],
    relative_humidity: data.hourly.relative_humidity_2m?.[i],
    precipitation: data.hourly.precipitation?.[i],
    weather_code: data.hourly.weather_code?.[i],
    wind_speed_10m: data.hourly.wind_speed_10m?.[i],
    wind_direction_10m: data.hourly.wind_direction_10m?.[i],
    wind_gusts_10m: data.hourly.wind_gusts_10m?.[i],
    is_day: data.hourly.is_day?.[i],
    unit: data.hourly_units.temperature_2m || '°C',
  }));
};

export const getDailyForecast = async (params: WeatherParams = {}): Promise<DailyForecast[]> => {
  const data = await getCurrentWeather(params);
  return data.daily.time.slice(0, 5).map((date: string, index: number) => ({
    date,
    temperature_max: data.daily.temperature_2m_max[index],
    temperature_min: data.daily.temperature_2m_min[index],
    precipitation_sum: data.daily.precipitation_sum?.[index],
    weather_code: data.daily.weather_code?.[index],
    wind_speed_10m_max: data.daily.wind_speed_10m_max?.[index],
    wind_gusts_10m_max: data.daily.wind_gusts_10m_max?.[index],
    unit: data.daily_units.temperature_2m_max || '°C',
  }));
};

export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Quyền truy cập vị trí bị từ chối');
  }

  let location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};

export const searchCity = async (query: string): Promise<City[]> => {
  const response = await axios.get(`${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=10`);
  return response.data.results?.map((item: any) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
  })) || [];
};