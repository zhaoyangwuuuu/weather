import { describe, it, expect } from "vitest";
import { aggregateForecastByDay, filterForecastByDay } from "./forecast";
import type { OpenWeatherForecastItem } from "./openweather/api.types";

function makeItem(dt: number, temp: number, icon = "01d", description = "clear sky"): OpenWeatherForecastItem {
  return {
    dt,
    main: { temp, feels_like: temp - 2, temp_min: temp - 1, temp_max: temp + 1, humidity: 50, pressure: 1013 },
    weather: [{ id: 800, main: "Clear", description, icon }],
    wind: { speed: 3, deg: 180 },
    clouds: { all: 0 },
    dt_txt: new Date(dt * 1000).toISOString(),
    visibility: 10000,
    pop: 0,
  } as OpenWeatherForecastItem;
}

const TZ_TOKYO    =  32400; // UTC+9
const TZ_TORONTO  = -14400; // UTC-4

// Use Date.UTC to avoid hardcoded timestamp errors
const APR29_21UTC = Date.UTC(2026, 3, 29, 21, 0, 0) / 1000; // Apr 29 21:00 UTC = Apr 30 06:00 Tokyo
const APR30_03UTC = Date.UTC(2026, 3, 30,  3, 0, 0) / 1000; // Apr 30 03:00 UTC = Apr 30 12:00 Tokyo (noon)
const APR29_15UTC = Date.UTC(2026, 3, 29, 15, 0, 0) / 1000; // Apr 29 15:00 UTC
const APR30_06UTC = Date.UTC(2026, 3, 30,  6, 0, 0) / 1000; // Apr 30 06:00 UTC

describe("aggregateForecastByDay", () => {
  it("groups items by local date", () => {
    const item1 = makeItem(APR29_21UTC, 15); // 21:00 UTC → Apr 30 06:00 Tokyo
    const item2 = makeItem(APR30_03UTC, 18); // 03:00 UTC → Apr 30 12:00 Tokyo
    const days = aggregateForecastByDay([item1, item2], TZ_TOKYO);
    expect(days).toHaveLength(1);
    expect(days[0].date.toISOString().slice(0, 10)).toBe("2026-04-30");
  });

  it("computes correct tempMin and tempMax", () => {
    const items = [
      makeItem(APR29_21UTC, 10),
      makeItem(APR30_03UTC, 20),
      makeItem(APR30_06UTC, 15),
    ];
    const days = aggregateForecastByDay(items, TZ_TOKYO);
    expect(days[0].tempMin).toBe(10);
    expect(days[0].tempMax).toBe(20);
  });

  it("picks noon-closest item for icon and condition", () => {
    // APR29_21UTC → 06:00 Tokyo, APR30_03UTC → 12:00 Tokyo (noon)
    const morning = makeItem(APR29_21UTC, 10, "morn-icon", "morning clouds");
    const noon    = makeItem(APR30_03UTC, 15, "noon-icon", "noon condition");
    const days = aggregateForecastByDay([morning, noon], TZ_TOKYO);
    expect(days[0].icon).toBe("noon-icon");
    expect(days[0].condition).toBe("noon condition");
  });

  it("splits items across local days at timezone boundary", () => {
    // Toronto UTC-4: Apr 29 23:30 UTC → Apr 29 19:30 local; Apr 30 06:00 UTC → Apr 30 02:00 local
    const apr29local = makeItem(Date.UTC(2026, 3, 29, 23, 30, 0) / 1000, 10);
    const apr30local = makeItem(APR30_06UTC, 12);
    const days = aggregateForecastByDay([apr29local, apr30local], TZ_TORONTO);
    expect(days).toHaveLength(2);
  });
});

describe("filterForecastByDay", () => {
  it("returns only items matching the given date string", () => {
    // APR29_15UTC (15:00 UTC) → Apr 29 local in Tokyo (15:00 + 9h = 00:00 Apr 30)... use Toronto instead
    // APR29_15UTC → Apr 29 11:00 Toronto, APR30_03UTC → Apr 29 23:00 Toronto
    const apr29item = makeItem(APR29_15UTC, 15); // Apr 29 15:00 UTC = Apr 29 11:00 Toronto
    const apr30item = makeItem(APR30_06UTC, 18); // Apr 30 06:00 UTC = Apr 30 02:00 Toronto
    const result = filterForecastByDay([apr29item, apr30item], "2026-04-29", TZ_TORONTO);
    expect(result).toHaveLength(1);
    expect(result[0].dt).toBe(apr29item.dt);
  });

  it("returns empty array when no items match", () => {
    const item = makeItem(APR29_15UTC, 15);
    expect(filterForecastByDay([item], "2026-05-01", TZ_TORONTO)).toHaveLength(0);
  });

  it("returns all items for a day when multiple exist", () => {
    const items = [0, 10800, 21600].map((offset) => makeItem(APR29_15UTC + offset, 15));
    const result = filterForecastByDay(items, "2026-04-29", TZ_TORONTO);
    expect(result).toHaveLength(3);
  });
});
