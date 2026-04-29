// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentWeatherCard } from "./CurrentWeatherCard";
import type { OpenWeatherCurrentWeatherResponse } from "@/lib/openweather/api.types";

const data: OpenWeatherCurrentWeatherResponse = {
  main: { temp: 14.6, feels_like: 13.1, temp_min: 12.0, temp_max: 16.2, humidity: 72, pressure: 1012 },
  weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
  wind: { speed: 4.3, deg: 270 },
  name: "Toronto",
  sys: { country: "CA" },
} as OpenWeatherCurrentWeatherResponse;

describe("CurrentWeatherCard", () => {
  it("renders city name and country", () => {
    render(<CurrentWeatherCard data={data} cityName="Toronto" country="CA" />);
    expect(screen.getByText("Toronto, CA")).toBeInTheDocument();
  });

  it("renders rounded temperature", () => {
    render(<CurrentWeatherCard data={data} cityName="Toronto" country="CA" />);
    expect(screen.getByText("15°C")).toBeInTheDocument();
  });

  it("renders feels like", () => {
    render(<CurrentWeatherCard data={data} cityName="Toronto" country="CA" />);
    expect(screen.getByText("13°C")).toBeInTheDocument();
  });

  it("renders humidity", () => {
    render(<CurrentWeatherCard data={data} cityName="Toronto" country="CA" />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("renders wind speed rounded", () => {
    render(<CurrentWeatherCard data={data} cityName="Toronto" country="CA" />);
    expect(screen.getByText("4 m/s")).toBeInTheDocument();
  });

  it("renders max and min temperatures", () => {
    render(<CurrentWeatherCard data={data} cityName="Toronto" country="CA" />);
    expect(screen.getByText("16°C")).toBeInTheDocument();
    expect(screen.getByText("12°C")).toBeInTheDocument();
  });

  it("renders weather icon with correct src and alt", () => {
    render(<CurrentWeatherCard data={data} cityName="Toronto" country="CA" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://openweathermap.org/img/wn/01d@2x.png");
    expect(img).toHaveAttribute("alt", "clear sky");
  });

  it("renders weather description", () => {
    render(<CurrentWeatherCard data={data} cityName="Toronto" country="CA" />);
    expect(screen.getByText("clear sky")).toBeInTheDocument();
  });
});
