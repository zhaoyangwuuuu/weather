export type UnixSeconds = number;
export type TimezoneOffsetSeconds = number;
export type Degrees = number;
export type Meters = number;
export type Millimeters = number;
export type Hectopascals = number;
export type Percentage = number;

export type OpenWeatherUnits = "standard" | "metric" | "imperial";

// --- Shared ---

export interface OpenWeatherCoordinates {
  lat: number;
  lon: number;
}

export interface OpenWeatherApiErrorResponse {
  cod: number | string;
  message: string;
  parameters?: string[];
}

// --- Request params ---

export interface OpenWeatherGeocodeSearchRequest {
  q: string;
  limit?: number;
}

export interface OpenWeatherCurrentWeatherRequest extends OpenWeatherCoordinates {
  units?: OpenWeatherUnits;
}

export interface OpenWeatherForecastRequest extends OpenWeatherCoordinates {
  units?: OpenWeatherUnits;
  cnt?: number;
}

// --- Geocoding ---

export interface OpenWeatherGeocodeLocation extends OpenWeatherCoordinates {
  name: string;
  local_names?: Record<string, string>;
  country: string;
  state?: string;
}

export type OpenWeatherGeocodeResponse = OpenWeatherGeocodeLocation[];

// --- Shared weather building blocks ---

export interface OpenWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OpenWeatherMainMeasurements {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: Hectopascals;
  humidity: Percentage;
  sea_level?: Hectopascals;
  grnd_level?: Hectopascals;
  temp_kf?: number;
}

export interface OpenWeatherWind {
  speed: number;
  deg: Degrees;
  gust?: number;
}

export interface OpenWeatherClouds {
  all: Percentage;
}

export interface OpenWeatherPrecipitation {
  "1h"?: Millimeters;
  "3h"?: Millimeters;
}

// --- Current weather (/data/2.5/weather) ---

export interface OpenWeatherCurrentWeatherResponse {
  coord: OpenWeatherCoordinates;
  weather: OpenWeatherCondition[];
  base?: string;
  main: OpenWeatherMainMeasurements;
  visibility?: Meters;
  wind: OpenWeatherWind;
  rain?: Pick<OpenWeatherPrecipitation, "1h">;
  snow?: Pick<OpenWeatherPrecipitation, "1h">;
  clouds: OpenWeatherClouds;
  dt: UnixSeconds;
  sys: {
    type?: number;
    id?: number;
    country?: string;
    sunrise?: UnixSeconds;
    sunset?: UnixSeconds;
  };
  timezone: TimezoneOffsetSeconds;
  id: number;
  name: string;
  cod: number;
}

// --- 5-day/3-hour forecast (/data/2.5/forecast) ---

export interface OpenWeatherForecastItem {
  dt: UnixSeconds;
  main: OpenWeatherMainMeasurements;
  weather: OpenWeatherCondition[];
  clouds: OpenWeatherClouds;
  wind: OpenWeatherWind;
  visibility: Meters;
  pop: number;
  rain?: Pick<OpenWeatherPrecipitation, "3h">;
  snow?: Pick<OpenWeatherPrecipitation, "3h">;
  sys: {
    pod: "d" | "n" | string;
  };
  dt_txt: string;
}

export interface OpenWeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OpenWeatherForecastItem[];
  city: {
    id: number;
    name: string;
    coord: OpenWeatherCoordinates;
    country: string;
    population?: number;
    timezone: TimezoneOffsetSeconds;
    sunrise: UnixSeconds;
    sunset: UnixSeconds;
  };
}
