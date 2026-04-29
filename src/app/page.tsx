import { Suspense, ViewTransition } from "react";
import { notFound } from "next/navigation";
import { SearchForm } from "@/components/SearchForm";
import { DefaultCityRedirect } from "@/components/DefaultCityRedirect";
import { CurrentWeatherCard } from "@/components/CurrentWeatherCard";
import { ForecastCard } from "@/components/ForecastCard";
import { DayDetailPanel } from "@/components/DayDetailPanel";
import { ScrollToForecast } from "@/components/ScrollToForecast";
import { getCurrentWeather, getForecast } from "@/lib/openweather/client";
import { aggregateForecastByDay, filterForecastByDay } from "@/lib/forecast";
import { CITIES } from "@/lib/cities";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; day?: string }>;
}) {
  const { city: citySlug, day } = await searchParams;
  const city = citySlug ? CITIES.find((c) => c.slug === citySlug) : undefined;
  if (citySlug && !city) notFound();

  return (
    <main className="min-h-screen flex flex-col items-center gap-5 sm:gap-8 py-4 px-4">
      <h1 className="text-4xl font-bold tracking-tight">Weather</h1>
      <Suspense>
        <SearchForm />
        <ScrollToForecast />
        <DefaultCityRedirect />
      </Suspense>
      {city && (
        <Suspense fallback={<span className="loading loading-spinner loading-lg" />}>
          <WeatherResults lat={city.lat} lon={city.lon} citySlug={city.slug} cityName={city.name} country={city.country} selectedDay={day} />
        </Suspense>
      )}
    </main>
  );
}

async function WeatherResults({
  lat,
  lon,
  citySlug,
  cityName,
  country,
  selectedDay,
}: {
  lat: number;
  lon: number;
  citySlug: string;
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
  const effectiveDay = selectedDay ?? days[0]?.date.toISOString().slice(0, 10);
  const selectedItems = effectiveDay
    ? filterForecastByDay(forecast.list, effectiveDay, tz)
    : [];

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <CurrentWeatherCard data={current} cityName={cityName} country={country} />
      <div className="flex flex-col sm:flex-row gap-2 sm:overflow-x-auto sm:pb-2">
        {days.map((day) => (
          <ForecastCard
            key={day.date.toISOString()}
            day={day}
            citySlug={citySlug}
            selectedDay={effectiveDay}
          />
        ))}
      </div>
      {selectedItems.length > 0 && (
        <div id="hourly-detail">
          <ViewTransition key={effectiveDay} name="hourly-panel" share="auto" enter="auto" default="none">
            <DayDetailPanel items={selectedItems} timezoneOffsetSeconds={tz} />
          </ViewTransition>
        </div>
      )}
    </div>
  );
}
