import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CITIES } from "./cities";

interface CityStore {
  lastCitySlug: string;
  setLastCitySlug: (slug: string) => void;
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      lastCitySlug: CITIES[0].slug,
      setLastCitySlug: (slug) => set({ lastCitySlug: slug }),
    }),
    { name: "weather-city" }
  )
);
