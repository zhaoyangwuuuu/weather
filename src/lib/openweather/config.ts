import "server-only";

export class OpenWeatherConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenWeatherConfigError";
  }
}

export function getOpenWeatherApiKey(): string {
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    throw new OpenWeatherConfigError(
      "OPENWEATHER_API_KEY is required. Add it to .env.local or your deployment environment.",
    );
  }

  return apiKey;
}
