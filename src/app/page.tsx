import { Suspense } from "react";
import { SearchForm } from "@/components/SearchForm";
import { CurrentWeatherCard } from "@/components/CurrentWeatherCard";
import { ForecastCard } from "@/components/ForecastCard";
import { DayDetailPanel } from "@/components/DayDetailPanel";
import { getCurrentWeather, getForecast } from "@/lib/openweather/client";
import { aggregateForecastByDay, filterForecastByDay } from "@/lib/forecast";
import { CITIES } from "@/lib/cities";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; day?: string }>;
}) {
  const { city: cityId, day } = await searchParams;
  const city = CITIES.find((c) => String(c.id) === cityId);

  return (
    <main className="min-h-screen flex flex-col items-center gap-5 sm:gap-8 py-8 sm:py-16 px-4">
      <h1 className="text-4xl font-bold tracking-tight">Weather</h1>
      <Suspense>
        <SearchForm />
      </Suspense>
      {city && (
        <Suspense fallback={<span className="loading loading-spinner loading-lg" />}>
          <WeatherResults lat={city.lat} lon={city.lon} cityId={city.id} cityName={city.name} country={city.country} selectedDay={day} />
        </Suspense>
      )}
    </main>
  );
}

async function WeatherResults({
  lat,
  lon,
  cityId,
  cityName,
  country,
  selectedDay,
}: {
  lat: number;
  lon: number;
  cityId: number;
  cityName: string;
  country: string;
  selectedDay?: string;
}) {
  const [current, forecast] = await Promise.all([
    getCurrentWeather({ lat, lon, units: "metric" }),
    getForecast({ lat, lon, units: "metric", cnt: 40 }),
  ]);

  const tz = forecast.city.timezone;
  const days = aggregateForecastByDay(forecast.list, tz);
  const selectedItems = selectedDay
    ? filterForecastByDay(forecast.list, selectedDay, tz)
    : [];

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <CurrentWeatherCard data={current} cityName={cityName} country={country} />
      <div className="flex flex-col sm:flex-row gap-2 sm:overflow-x-auto sm:pb-2">
        {days.map((day) => (
          <ForecastCard
            key={day.date.toISOString()}
            day={day}
            cityId={cityId}
            selectedDay={selectedDay}
          />
        ))}
      </div>
      {selectedItems.length > 0 && <DayDetailPanel items={selectedItems} timezoneOffsetSeconds={tz} />}
    </div>
  );
}
