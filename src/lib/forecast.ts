import type { OpenWeatherForecastItem } from "./openweather/api.types";

export interface DailyForecast {
  date: Date;
  tempMin: number;
  tempMax: number;
  condition: string;
  icon: string;
}

function localDateKey(dt: number, timezoneOffsetSeconds: number): string {
  const localMs = (dt + timezoneOffsetSeconds) * 1000;
  return new Date(localMs).toISOString().slice(0, 10);
}

export function aggregateForecastByDay(
  items: OpenWeatherForecastItem[],
  timezoneOffsetSeconds: number,
): DailyForecast[] {
  const byDay = new Map<string, OpenWeatherForecastItem[]>();

  for (const item of items) {
    const key = localDateKey(item.dt, timezoneOffsetSeconds);
    const bucket = byDay.get(key) ?? [];
    bucket.push(item);
    byDay.set(key, bucket);
  }

  return Array.from(byDay.entries()).map(([dateStr, dayItems]) => {
    const temps = dayItems.map((i) => i.main.temp);

    // Pick the slot closest to local noon for the representative icon/condition
    const noonItem = dayItems.reduce((best, item) => {
      const localHour = Math.floor(((item.dt + timezoneOffsetSeconds) % 86400) / 3600);
      const bestHour = Math.floor(((best.dt + timezoneOffsetSeconds) % 86400) / 3600);
      return Math.abs(localHour - 12) < Math.abs(bestHour - 12) ? item : best;
    });

    return {
      date: new Date(`${dateStr}T12:00:00Z`),
      tempMin: Math.min(...temps),
      tempMax: Math.max(...temps),
      condition: noonItem.weather[0].description,
      icon: noonItem.weather[0].icon,
    };
  });
}

export function filterForecastByDay(
  items: OpenWeatherForecastItem[],
  day: string,
  timezoneOffsetSeconds: number,
): OpenWeatherForecastItem[] {
  return items.filter((item) => localDateKey(item.dt, timezoneOffsetSeconds) === day);
}
