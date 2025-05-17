export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m?: number[];
    precipitation?: number[];
    weather_code?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    wind_gusts_10m?: number[];
    is_day?: number[];
    uv_index?: number[];
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    relative_humidity_2m?: string;
    precipitation?: string;
    weather_code?: string;
    wind_speed_10m?: string;
    wind_direction_10m?: string;
    wind_gusts_10m?: string;
    is_day?: string;
    uv_index?: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum?: number[];
    weather_code?: number[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
    uv_index_max?: number[];
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_sum?: string;
    weather_code?: string;
    wind_speed_10m_max?: string;
    wind_gusts_10m_max?: string;
    uv_index_max?: string;
  };
}

export interface HourlyForecast {
  time: string;
  temperature?: number;
  relative_humidity?: number;
  precipitation?: number;
  weather_code?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  wind_gusts_10m?: number;
  is_day?: number;
  uv_index?: number;
  unit: string;
}

export interface DailyForecast {
  date: string;
  temperature_max?: number;
  temperature_min?: number;
  precipitation_sum?: number;
  weather_code?: number;
  wind_speed_10m_max?: number;
  wind_gusts_10m_max?: number;
  uv_index_max?: number;
  unit: string;
}

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}