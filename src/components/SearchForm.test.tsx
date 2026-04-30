import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchForm } from "./SearchForm";
import { CITIES } from "@/lib/cities";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/lib/cityStore", () => ({
  useCityStore: (selector: (s: { lastCitySlug: string; setLastCitySlug: (s: string) => void }) => unknown) =>
    selector({ lastCitySlug: "toronto", setLastCitySlug: vi.fn() }),
}));

beforeEach(() => {
  mockPush.mockClear();
  mockSearchParams.delete("city");
});

describe("SearchForm", () => {
  it("renders all cities as options", () => {
    render(<SearchForm />);
    for (const city of CITIES) {
      expect(screen.getByRole("option", { name: `${city.name}, ${city.country}` })).toBeInTheDocument();
    }
  });

  it("renders placeholder option", () => {
    render(<SearchForm />);
    expect(screen.getByRole("option", { name: "Select a city..." })).toBeInTheDocument();
  });

  it("shows selected city from search params", () => {
    mockSearchParams.set("city", "ottawa");
    render(<SearchForm />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("ottawa");
  });

  it("calls router.push with slug URL on change", () => {
    render(<SearchForm />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "tokyo" } });
    expect(mockPush).toHaveBeenCalledWith("/?city=tokyo");
  });
});
