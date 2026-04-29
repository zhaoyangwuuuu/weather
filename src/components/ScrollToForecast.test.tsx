// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ScrollToForecast } from "./ScrollToForecast";

const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

beforeEach(() => {
  mockSearchParams.delete("day");
  document.body.innerHTML = "";
});

describe("ScrollToForecast", () => {
  it("scrolls to #hourly-detail on mobile when day param is set", () => {
    Object.defineProperty(window, "innerWidth", { value: 390, writable: true, configurable: true });
    const el = document.createElement("div");
    el.id = "hourly-detail";
    const scrollSpy = vi.fn();
    el.scrollIntoView = scrollSpy;
    document.body.appendChild(el);

    mockSearchParams.set("day", "2026-04-29");
    render(<ScrollToForecast />);

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("does not scroll on desktop (width >= 640)", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true, configurable: true });
    const el = document.createElement("div");
    el.id = "hourly-detail";
    const scrollSpy = vi.fn();
    el.scrollIntoView = scrollSpy;
    document.body.appendChild(el);

    mockSearchParams.set("day", "2026-04-29");
    render(<ScrollToForecast />);

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("does not scroll when no day param", () => {
    Object.defineProperty(window, "innerWidth", { value: 390, writable: true, configurable: true });
    const el = document.createElement("div");
    el.id = "hourly-detail";
    const scrollSpy = vi.fn();
    el.scrollIntoView = scrollSpy;
    document.body.appendChild(el);

    render(<ScrollToForecast />);

    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
