import type { OpenWeatherForecastItem } from "./openweather/api.types";

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

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

// Collapses the raw 3-hourly forecast list (up to 40 slots) into one entry per
// local calendar day. Each entry carries the day's min/max temperature and the
// most frequently occurring weather condition (day/night icon variants are merged
// so rain split across 10d/10n beats a less common single-code condition).
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

    // Pick the most frequent condition across the day's slots.
    // Normalize day/night variants (10d, 10n → 10) before counting so
    // the same condition split across daylight and overnight hours isn't
    // treated as two separate categories.
    const iconCount = new Map<string, number>();
    for (const item of dayItems) {
      const base = item.weather[0].icon.slice(0, -1); // strip d/n suffix
      iconCount.set(base, (iconCount.get(base) ?? 0) + 1);
    }
    const dominantBase = [...iconCount.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    const dominantIcon = `${dominantBase}d`; // always use day variant for summary card
    const representativeItem = dayItems.find((i) => i.weather[0].icon.startsWith(dominantBase))!;

    return {
      date: new Date(`${dateStr}T12:00:00Z`),
      tempMin: Math.min(...temps),
      tempMax: Math.max(...temps),
      condition: representativeItem.weather[0].description,
      icon: dominantIcon,
    };
  });
}

// Returns the raw 3-hour forecast slots for a single local calendar day so the
// day detail panel can show only the selected day's timeline.
export function filterForecastByDay(
  items: OpenWeatherForecastItem[],
  day: string,
  timezoneOffsetSeconds: number,
): OpenWeatherForecastItem[] {
  return items.filter((item) => localDateKey(item.dt, timezoneOffsetSeconds) === day);
}
