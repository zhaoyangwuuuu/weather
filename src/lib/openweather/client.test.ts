import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  makeMockFetch,
  makeMockFetchNetworkError,
  makeMockFetchAbortError,
} from "@/__mocks__/fetch";
import { geocode, getCurrentWeather, getForecast, OpenWeatherError, CACHE_TAGS } from "./client";

const FAKE_API_KEY = "test-api-key-abc";

type FetchCall = [string, RequestInit & { next?: { revalidate?: number; tags?: string[] } }];

function getCalledUrl(): URL {
  return new URL(vi.mocked(fetch).mock.calls[0][0] as string);
}

function getCalledOptions(): FetchCall[1] {
  return vi.mocked(fetch).mock.calls[0][1] as FetchCall[1];
}

describe("OpenWeather client", () => {
  beforeEach(() => {
    vi.stubEnv("OPENWEATHER_API_KEY", FAKE_API_KEY);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  // ─── URL construction ────────────────────────────────────────────────────

  describe("URL construction", () => {
    it("appends the API key as appid", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: [] }));
      await geocode({ q: "London" });
      expect(getCalledUrl().searchParams.get("appid")).toBe(FAKE_API_KEY);
    });

    it("uses the correct geocode path", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: [] }));
      await geocode({ q: "London" });
      const url = getCalledUrl();
      expect(url.origin).toBe("https://api.openweathermap.org");
      expect(url.pathname).toBe("/geo/1.0/direct");
    });

    it("passes q for geocode", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: [] }));
      await geocode({ q: "Tokyo" });
      expect(getCalledUrl().searchParams.get("q")).toBe("Tokyo");
    });

    it("includes limit when provided", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: [] }));
      await geocode({ q: "Paris", limit: 5 });
      expect(getCalledUrl().searchParams.get("limit")).toBe("5");
    });

    it("omits limit when not provided", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: [] }));
      await geocode({ q: "Berlin" });
      expect(getCalledUrl().searchParams.has("limit")).toBe(false);
    });

    it("uses the correct current weather path", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: { cod: 200 } }));
      await getCurrentWeather({ lat: 0, lon: 0 });
      expect(getCalledUrl().pathname).toBe("/data/2.5/weather");
    });

    it("passes lat and lon for getCurrentWeather", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: { cod: 200 } }));
      await getCurrentWeather({ lat: 48.85, lon: 2.35 });
      const url = getCalledUrl();
      expect(url.searchParams.get("lat")).toBe("48.85");
      expect(url.searchParams.get("lon")).toBe("2.35");
    });

    it("includes units when provided", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: { cod: 200 } }));
      await getCurrentWeather({ lat: 0, lon: 0, units: "metric" });
      expect(getCalledUrl().searchParams.get("units")).toBe("metric");
    });

    it("omits units when not provided", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: { cod: 200 } }));
      await getCurrentWeather({ lat: 0, lon: 0 });
      expect(getCalledUrl().searchParams.has("units")).toBe(false);
    });

    it("uses the correct forecast path", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: { cod: "200", list: [], city: {} } }));
      await getForecast({ lat: 0, lon: 0 });
      expect(getCalledUrl().pathname).toBe("/data/2.5/forecast");
    });

    it("includes cnt when provided", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: { cod: "200", list: [], city: {} } }));
      await getForecast({ lat: 0, lon: 0, cnt: 8 });
      expect(getCalledUrl().searchParams.get("cnt")).toBe("8");
    });

    it("omits cnt when not provided", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: { cod: "200", list: [], city: {} } }));
      await getForecast({ lat: 0, lon: 0 });
      expect(getCalledUrl().searchParams.has("cnt")).toBe(false);
    });
  });

  // ─── Next.js cache options ───────────────────────────────────────────────

  describe("Next.js cache options", () => {
    it("sets revalidate: 86400 and owm-geocode tag for geocode", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: [] }));
      await geocode({ q: "London" });
      const opts = getCalledOptions();
      expect(opts.next?.revalidate).toBe(86400);
      expect(opts.next?.tags).toContain(CACHE_TAGS.geocode);
    });

    it("sets revalidate: 600 and location tags for getCurrentWeather", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: { cod: 200 } }));
      await getCurrentWeather({ lat: 51.5, lon: -0.1 });
      const opts = getCalledOptions();
      expect(opts.next?.revalidate).toBe(600);
      expect(opts.next?.tags).toContain(CACHE_TAGS.weather);
      expect(opts.next?.tags).toContain(`${CACHE_TAGS.weather}-51.5000--0.1000`);
    });

    it("sets revalidate: 1800 and location tags for getForecast", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ body: { cod: "200", list: [], city: {} } }));
      await getForecast({ lat: 40.7, lon: -74.0 });
      const opts = getCalledOptions();
      expect(opts.next?.revalidate).toBe(1800);
      expect(opts.next?.tags).toContain(CACHE_TAGS.forecast);
      expect(opts.next?.tags).toContain(`${CACHE_TAGS.forecast}-40.7000--74.0000`);
    });
  });

  // ─── Happy path ──────────────────────────────────────────────────────────

  describe("successful responses", () => {
    it("returns parsed JSON on 200", async () => {
      const mockBody = [{ name: "London", lat: 51.5, lon: -0.1, country: "GB" }];
      vi.stubGlobal("fetch", makeMockFetch({ body: mockBody }));
      expect(await geocode({ q: "London" })).toEqual(mockBody);
    });
  });

  // ─── HTTP errors ─────────────────────────────────────────────────────────

  describe("HTTP error responses", () => {
    it("throws OpenWeatherError on non-2xx", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ status: 401, statusText: "Unauthorized", body: null }));
      await expect(geocode({ q: "London" })).rejects.toThrow(OpenWeatherError);
    });

    it("uses body.message when the API returns a JSON error", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ status: 404, statusText: "Not Found", body: { message: "city not found" } }));
      await expect(geocode({ q: "XxX" })).rejects.toThrow("city not found");
    });

    it("falls back to HTTP status when body is not JSON", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ status: 500, statusText: "Internal Server Error", body: null }));
      await expect(geocode({ q: "London" })).rejects.toThrow("HTTP 500");
    });

    it("falls back to HTTP status when JSON body has no message field", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ status: 429, statusText: "Too Many Requests", body: { code: 429 } }));
      await expect(geocode({ q: "London" })).rejects.toThrow("HTTP 429");
    });

    it("thrown error has name OpenWeatherError", async () => {
      vi.stubGlobal("fetch", makeMockFetch({ status: 403, statusText: "Forbidden", body: null }));
      await expect(geocode({ q: "London" })).rejects.toMatchObject({ name: "OpenWeatherError" });
    });
  });

  // ─── Network errors ──────────────────────────────────────────────────────

  describe("network errors", () => {
    it("throws OpenWeatherError on fetch rejection", async () => {
      vi.stubGlobal("fetch", makeMockFetchNetworkError("Connection refused"));
      await expect(geocode({ q: "London" })).rejects.toThrow(OpenWeatherError);
    });

    it("uses the underlying error message", async () => {
      vi.stubGlobal("fetch", makeMockFetchNetworkError("DNS lookup failed"));
      await expect(geocode({ q: "London" })).rejects.toThrow("DNS lookup failed");
    });

    it("sets error.cause to the original error", async () => {
      const original = new Error("ECONNREFUSED");
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(original));
      const err = await geocode({ q: "London" }).catch((e) => e);
      expect(err.cause).toBe(original);
    });
  });

  // ─── Timeout ─────────────────────────────────────────────────────────────

  describe("timeout", () => {
    it("throws OpenWeatherError when fetch rejects with AbortError", async () => {
      vi.stubGlobal("fetch", makeMockFetchAbortError());
      await expect(geocode({ q: "London" })).rejects.toThrow(OpenWeatherError);
    });

    it("includes timeout duration in the error message", async () => {
      vi.stubGlobal("fetch", makeMockFetchAbortError());
      await expect(geocode({ q: "London" })).rejects.toThrow("10000ms");
    });

    it("aborts the signal after the default 10s timeout", async () => {
      let capturedSignal: AbortSignal | undefined;
      vi.stubGlobal(
        "fetch",
        vi.fn((_, options: RequestInit) => {
          capturedSignal = options.signal ?? undefined;
          return new Promise((_, reject) => {
            options.signal?.addEventListener("abort", () => {
              const err = new Error("The operation was aborted");
              err.name = "AbortError";
              reject(err);
            });
          });
        }),
      );

      const promise = getCurrentWeather({ lat: 51.5, lon: -0.1 }).catch(() => {});
      await vi.advanceTimersByTimeAsync(10_001);
      expect(capturedSignal?.aborted).toBe(true);
      await promise;
    });
  });
});
