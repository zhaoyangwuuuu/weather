import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DayDetailPanel } from "./DayDetailPanel";
import type { OpenWeatherForecastItem } from "@/lib/openweather/api.types";

function makeItem(dt: number, temp: number, feelsLike: number, windSpeed: number): OpenWeatherForecastItem {
  return {
    dt,
    main: { temp, feels_like: feelsLike, temp_min: temp - 1, temp_max: temp + 1, humidity: 60, pressure: 1010 },
    weather: [{ id: 801, main: "Clouds", description: "few clouds", icon: "02d" }],
    wind: { speed: windSpeed, deg: 90 },
    clouds: { all: 20 },
    dt_txt: new Date(dt * 1000).toISOString(),
    visibility: 10000,
    pop: 0,
  } as OpenWeatherForecastItem;
}

// 2026-04-29 15:00 UTC
const UTC_3PM = Date.UTC(2026, 3, 29, 15, 0, 0) / 1000;

describe("DayDetailPanel", () => {
  it("renders header row labels", () => {
    render(<DayDetailPanel items={[]} timezoneOffsetSeconds={0} />);
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Temp")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Feels")).toBeInTheDocument();
    expect(screen.getByText("Wind")).toBeInTheDocument();
  });

  it("renders correct local time with UTC offset 0", () => {
    // 15:00 UTC + 0 = 15:00 = 3:00pm
    render(<DayDetailPanel items={[makeItem(UTC_3PM, 20, 18, 5)]} timezoneOffsetSeconds={0} />);
    expect(screen.getByText(/3:00pm/)).toBeInTheDocument();
  });

  it("applies positive timezone offset (UTC+9 Tokyo)", () => {
    // 15:00 UTC + 9h = 00:00 next day = 12:00am
    render(<DayDetailPanel items={[makeItem(UTC_3PM, 20, 18, 5)]} timezoneOffsetSeconds={32400} />);
    expect(screen.getByText(/12:00am/)).toBeInTheDocument();
  });

  it("applies negative timezone offset (UTC-4 Toronto)", () => {
    // 15:00 UTC - 4h = 11:00am
    render(<DayDetailPanel items={[makeItem(UTC_3PM, 20, 18, 5)]} timezoneOffsetSeconds={-14400} />);
    expect(screen.getByText(/11:00am/)).toBeInTheDocument();
  });

  it("renders rounded temperature", () => {
    render(<DayDetailPanel items={[makeItem(UTC_3PM, 14.7, 13.2, 3.4)]} timezoneOffsetSeconds={0} />);
    expect(screen.getByText("15°C")).toBeInTheDocument();
  });

  it("renders rounded feels like", () => {
    render(<DayDetailPanel items={[makeItem(UTC_3PM, 14.7, 13.2, 3.4)]} timezoneOffsetSeconds={0} />);
    expect(screen.getByText("13°C")).toBeInTheDocument();
  });

  it("renders rounded wind speed with unit", () => {
    render(<DayDetailPanel items={[makeItem(UTC_3PM, 14.7, 13.2, 7.8)]} timezoneOffsetSeconds={0} />);
    expect(screen.getByText("8 m/s")).toBeInTheDocument();
  });

  it("renders one row per item", () => {
    const items = [
      makeItem(UTC_3PM, 10, 8, 3),
      makeItem(UTC_3PM + 10800, 12, 10, 4),
    ];
    render(<DayDetailPanel items={items} timezoneOffsetSeconds={0} />);
    expect(screen.getAllByText(/m\/s/)).toHaveLength(2);
  });
});
