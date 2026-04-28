import "server-only";

const OPENWEATHER_API_KEY_ENV = "OPENWEATHER_API_KEY";

export class OpenWeatherConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenWeatherConfigError";
  }
}

export function getOpenWeatherApiKey(): string {
  const apiKey = process.env[OPENWEATHER_API_KEY_ENV]?.trim();

  if (!apiKey) {
    throw new OpenWeatherConfigError(
      `${OPENWEATHER_API_KEY_ENV} is required. Add it to .env.local or your deployment environment.`,
    );
  }

  return apiKey;
}
