import { describe, it, expect, beforeEach, vi } from "vitest";
import { getOpenWeatherApiKey, OpenWeatherConfigError } from "./config";

describe("getOpenWeatherApiKey", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe("when OPENWEATHER_API_KEY is set", () => {
    it("returns the key", () => {
      vi.stubEnv("OPENWEATHER_API_KEY", "test-api-key-123");
      expect(getOpenWeatherApiKey()).toBe("test-api-key-123");
    });

    it("trims surrounding whitespace", () => {
      vi.stubEnv("OPENWEATHER_API_KEY", "  spaces-around  ");
      expect(getOpenWeatherApiKey()).toBe("spaces-around");
    });
  });

  describe("when OPENWEATHER_API_KEY is missing or blank", () => {
    it("throws OpenWeatherConfigError when empty string", () => {
      vi.stubEnv("OPENWEATHER_API_KEY", "");
      expect(() => getOpenWeatherApiKey()).toThrow(OpenWeatherConfigError);
    });

    it("throws OpenWeatherConfigError when only whitespace", () => {
      vi.stubEnv("OPENWEATHER_API_KEY", "   ");
      expect(() => getOpenWeatherApiKey()).toThrow(OpenWeatherConfigError);
    });

    it("includes a descriptive message", () => {
      vi.stubEnv("OPENWEATHER_API_KEY", "");
      expect(() => getOpenWeatherApiKey()).toThrow(
        "OPENWEATHER_API_KEY is required",
      );
    });

    it("thrown error has name OpenWeatherConfigError", () => {
      vi.stubEnv("OPENWEATHER_API_KEY", "");
      expect(() => getOpenWeatherApiKey()).toThrowError(
        expect.objectContaining({ name: "OpenWeatherConfigError" }),
      );
    });
  });
});
