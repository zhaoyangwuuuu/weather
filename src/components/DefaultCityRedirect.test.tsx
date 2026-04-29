// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { DefaultCityRedirect } from "./DefaultCityRedirect";
import { CITIES } from "@/lib/cities";

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
const mockSetLastCitySlug = vi.fn();
let mockLastCitySlug: string = CITIES[0].slug;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/lib/cityStore", () => ({
  useCityStore: (selector: (s: { lastCitySlug: string; setLastCitySlug: (s: string) => void }) => unknown) =>
    selector({ lastCitySlug: mockLastCitySlug, setLastCitySlug: mockSetLastCitySlug }),
}));

beforeEach(() => {
  mockReplace.mockClear();
  mockSetLastCitySlug.mockClear();
  mockSearchParams.delete("city");
  mockLastCitySlug = CITIES[0].slug;
});

describe("DefaultCityRedirect", () => {
  it("redirects to stored slug when no city param", () => {
    mockLastCitySlug = "tokyo";
    render(<DefaultCityRedirect />);
    expect(mockReplace).toHaveBeenCalledWith("/?city=tokyo");
  });

  it("does nothing when city param is present", () => {
    mockSearchParams.set("city", "toronto");
    render(<DefaultCityRedirect />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("falls back to first city when stored slug is invalid", () => {
    mockLastCitySlug = "invalid-city";
    render(<DefaultCityRedirect />);
    expect(mockReplace).toHaveBeenCalledWith(`/?city=${CITIES[0].slug}`);
    expect(mockSetLastCitySlug).toHaveBeenCalledWith(CITIES[0].slug);
  });

  it("does not reset store when stored slug is valid", () => {
    mockLastCitySlug = "ottawa";
    render(<DefaultCityRedirect />);
    expect(mockSetLastCitySlug).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/?city=ottawa");
  });
});
