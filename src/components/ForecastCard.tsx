import Link from "next/link";
import type { DailyForecast } from "@/lib/forecast";
import { ForecastCardPending } from "./ForecastCardPending";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface ForecastCardProps {
  day: DailyForecast;
  citySlug: string;
  selectedDay?: string;
}

export function ForecastCard({ day, citySlug, selectedDay }: ForecastCardProps) {
  const dayName = DAY_NAMES[day.date.getUTCDay()];
  const high = Math.round(day.tempMax);
  const low = Math.round(day.tempMin);
  const dateStr = day.date.toISOString().slice(0, 10);
  const isSelected = selectedDay === dateStr;
  const href = `/?city=${citySlug}&day=${dateStr}`;
  const mutedClass = isSelected ? "opacity-70" : "text-base-content/60";

  return (
    <Link
      href={href}
      scroll={false}
      className={`card flex-1 relative transition-colors ${
        isSelected ? "bg-accent text-accent-content" : "bg-base-200 hover:bg-base-300"
      }`}
    >
      <ForecastCardPending />
      {/* Mobile: row — sm+: column */}
      <div className="card-body flex-row sm:flex-col items-center p-3 gap-3 sm:gap-1">
        <p className="text-sm flex-1 sm:flex-none sm:text-center">
          <span className="font-semibold inline-block w-10">{dayName}</span>
          <span className={mutedClass}>{MONTH_NAMES[day.date.getUTCMonth()]} {day.date.getUTCDate()}</span>
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://openweathermap.org/img/wn/${day.icon}.png`}
          alt={day.condition}
          width={40}
          height={40}
          className="shrink-0"
        />
        <div className="flex gap-2 sm:flex-col sm:items-center shrink-0">
          <p className="font-bold text-sm">{high}°</p>
          <p className={`text-sm ${mutedClass}`}>{low}°</p>
        </div>
      </div>
    </Link>
  );
}
