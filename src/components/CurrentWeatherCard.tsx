import type { OpenWeatherCurrentWeatherResponse } from "@/lib/openweather/api.types";

export function CurrentWeatherCard({
  data,
  cityName,
  country,
}: {
  data: OpenWeatherCurrentWeatherResponse;
  cityName: string;
  country: string;
}) {
  const temp = Math.round(data.main.temp);
  const tempMax = Math.round(data.main.temp_max);
  const tempMin = Math.round(data.main.temp_min);
  const feelsLike = Math.round(data.main.feels_like);
  const wind = Math.round(data.wind.speed);
  const condition = data.weather[0];
  const location = `${cityName}, ${country}`;

  return (
    <div className="card bg-base-200 w-full">
      <div className="card-body gap-4">
        <h2 className="card-title text-2xl">{location}</h2>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://openweathermap.org/img/wn/${condition.icon}@2x.png`}
            alt={condition.description}
            width={80}
            height={80}
          />
          <div className="flex-1">
            <p className="text-5xl sm:text-6xl font-bold">{temp}°C</p>
            <p className="capitalize text-base-content/70 mt-1">{condition.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-base-content/50">Max</span>
            <span className="text-xl font-bold">{tempMax}°C</span>
            <span className="text-sm text-base-content/50 mt-2">Min</span>
            <span className="text-xl font-bold">{tempMin}°C</span>
          </div>
        </div>
        <div className="grid grid-cols-3 bg-base-300 rounded-box divide-x divide-base-content/10">
          <div className="flex flex-col items-center py-3 px-2">
            <span className="text-xs text-base-content/60">Feels like</span>
            <span className="font-bold mt-1">{feelsLike}°C</span>
          </div>
          <div className="flex flex-col items-center py-3 px-2">
            <span className="text-xs text-base-content/60">Humidity</span>
            <span className="font-bold mt-1">{data.main.humidity}%</span>
          </div>
          <div className="flex flex-col items-center py-3 px-2">
            <span className="text-xs text-base-content/60">Wind</span>
            <span className="font-bold mt-1">{wind} m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
