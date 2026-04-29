import type { OpenWeatherForecastItem } from "@/lib/openweather/api.types";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ROW = "flex flex-row items-center px-4 py-3 gap-3";
const COL_DATETIME = "w-28 shrink-0";
const COL_ICON     = "w-10 shrink-0 hidden sm:block";
const COL_TEMP     = "w-12 shrink-0";
const COL_DESC     = "flex-1 hidden sm:block truncate";
const COL_FEELS    = "w-24 shrink-0";
const COL_WIND     = "w-10 shrink-0 text-right";

export function DayDetailPanel({
  items,
  timezoneOffsetSeconds,
}: {
  items: OpenWeatherForecastItem[];
  timezoneOffsetSeconds: number;
}) {
  return (
    <div className="flex flex-col gap-2">

      {/* Header row — identical structure to data rows */}
      <div className="rounded-box bg-base-200">
        <div className={`${ROW} text-xs text-base-content/50 font-semibold`}>
          <span className={COL_DATETIME}>Date</span>
          <span className={COL_ICON} />
          <span className={COL_TEMP}>Temp</span>
          <span className={COL_DESC}>Description</span>
          <span className={COL_FEELS}>Feels Like</span>
          <span className={COL_WIND}>Wind</span>
        </div>
      </div>

      {items.map((item) => {
        const localDate = new Date((item.dt + timezoneOffsetSeconds) * 1000);
        const hour24 = localDate.getUTCHours();
        const ampm = hour24 >= 12 ? "pm" : "am";
        const hour12 = hour24 % 12 || 12;
        const time = `${hour12}:00${ampm}`;
        const date = `${MONTHS[localDate.getUTCMonth()]} ${localDate.getUTCDate()}`;
        const temp = Math.round(item.main.temp);
        const feelsLike = Math.round(item.main.feels_like);
        const condition = item.weather[0];

        return (
          <div key={item.dt} className="rounded-box bg-base-200">
            <div className={ROW}>
              <p className={`text-sm font-semibold ${COL_DATETIME}`}>{date} {time}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://openweathermap.org/img/wn/${condition.icon}.png`}
                alt={condition.description}
                width={40}
                height={40}
                className={COL_ICON}
              />
              <p className={`font-bold ${COL_TEMP}`}>{temp}°C</p>
              <p className={`text-sm text-base-content/60 capitalize ${COL_DESC}`}>{condition.description}</p>
              <p className={`text-sm text-base-content/60 ${COL_FEELS}`}>{feelsLike}°C</p>
              <p className={`text-sm text-base-content/60 ${COL_WIND}`}>{Math.round(item.wind.speed)} m/s</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
