// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ForecastCard } from "./ForecastCard";
import type { DailyForecast } from "@/lib/forecast";

vi.mock("next/link", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/link")>();
  const MockLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  );
  return { ...actual, default: MockLink, useLinkStatus: () => ({ pending: false }) };
});

const day: DailyForecast = {
  date: new Date("2026-04-30T12:00:00Z"), // Thursday
  tempMin: 5.3,
  tempMax: 13.7,
  condition: "overcast clouds",
  icon: "04d",
};

describe("ForecastCard", () => {
  it("renders day name", () => {
    render(<ForecastCard day={day} citySlug="toronto" />);
    expect(screen.getByText("Thu")).toBeInTheDocument();
  });

  it("renders formatted date", () => {
    render(<ForecastCard day={day} citySlug="toronto" />);
    expect(screen.getByText(/Apr 30/)).toBeInTheDocument();
  });

  it("renders rounded high temperature", () => {
    render(<ForecastCard day={day} citySlug="toronto" />);
    expect(screen.getByText("14°")).toBeInTheDocument();
  });

  it("renders rounded low temperature", () => {
    render(<ForecastCard day={day} citySlug="toronto" />);
    expect(screen.getByText("5°")).toBeInTheDocument();
  });

  it("builds href with citySlug and date", () => {
    render(<ForecastCard day={day} citySlug="toronto" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/?city=toronto&day=2026-04-30");
  });

  it("applies accent class when selected", () => {
    render(<ForecastCard day={day} citySlug="toronto" selectedDay="2026-04-30" />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("bg-accent");
  });

  it("applies base class when not selected", () => {
    render(<ForecastCard day={day} citySlug="toronto" selectedDay="2026-05-01" />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("bg-base-200");
  });

  it("renders weather icon", () => {
    render(<ForecastCard day={day} citySlug="toronto" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://openweathermap.org/img/wn/04d.png");
    expect(img).toHaveAttribute("alt", "overcast clouds");
  });
});
