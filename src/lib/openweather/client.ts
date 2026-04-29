import "server-only";

import { getOpenWeatherApiKey } from "./config";
import type {
  OpenWeatherCurrentWeatherRequest,
  OpenWeatherCurrentWeatherResponse,
  OpenWeatherForecastRequest,
  OpenWeatherForecastResponse,
  OpenWeatherGeocodeSearchRequest,
  OpenWeatherGeocodeResponse,
} from "./api.types";

const BASE_URL = "https://api.openweathermap.org";
const DEFAULT_TIMEOUT_MS = 10_000;

export const CACHE_TAGS = {
  geocode: "owm-geocode",
  weather: "owm-weather",
  forecast: "owm-forecast",
} as const;

export class OpenWeatherError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OpenWeatherError";
  }
}

type FetchOpenWeatherOptions = {
  revalidate?: number | false;
  tags?: string[];
  timeoutMs?: number;
};

async function fetchOpenWeather<T>(
  path: string,
  params: Record<string, string>,
  options: FetchOpenWeatherOptions = {},
): Promise<T> {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("appid", getOpenWeatherApiKey());

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: options.revalidate, tags: options.tags },
    }).catch((err: unknown) => {
      if (err instanceof Error && err.name === "AbortError") {
        throw new OpenWeatherError(
          `Request timed out after ${options.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms`,
          { cause: err },
        );
      }
      throw new OpenWeatherError(
        err instanceof Error ? err.message : "Network request failed",
        { cause: err },
      );
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const body = await res.json();
        if (typeof body?.message === "string") message = body.message;
      } catch {
        // use default message
      }
      throw new OpenWeatherError(message);
    }

    return await res.json() as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function geocode(
  req: OpenWeatherGeocodeSearchRequest,
): Promise<OpenWeatherGeocodeResponse> {
  const params: Record<string, string> = { q: req.q };
  if (req.limit !== undefined) params.limit = String(req.limit);

  return fetchOpenWeather("/geo/1.0/direct", params, {
    revalidate: 86400,
    tags: [CACHE_TAGS.geocode],
  });
}

export async function getCurrentWeather(
  req: OpenWeatherCurrentWeatherRequest,
): Promise<OpenWeatherCurrentWeatherResponse> {
  const params: Record<string, string> = {
    lat: req.lat.toString(),
    lon: req.lon.toString(),
  };
  if (req.units !== undefined) params.units = req.units;

  return fetchOpenWeather("/data/2.5/weather", params, {
    revalidate: 7200,
    tags: [CACHE_TAGS.weather, `${CACHE_TAGS.weather}-${req.lat.toFixed(4)}-${req.lon.toFixed(4)}`],
  });
}

export async function getForecast(
  req: OpenWeatherForecastRequest,
): Promise<OpenWeatherForecastResponse> {
  const params: Record<string, string> = {
    lat: req.lat.toString(),
    lon: req.lon.toString(),
  };
  if (req.units !== undefined) params.units = req.units;
  if (req.cnt !== undefined) params.cnt = String(req.cnt);

  return fetchOpenWeather("/data/2.5/forecast", params, {
    revalidate: 7200,
    tags: [CACHE_TAGS.forecast, `${CACHE_TAGS.forecast}-${req.lat.toFixed(4)}-${req.lon.toFixed(4)}`],
  });
}
