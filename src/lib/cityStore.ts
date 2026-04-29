import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CITIES } from "./cities";

interface CityStore {
  lastCityId: number;
  setLastCityId: (id: number) => void;
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      lastCityId: CITIES[0].id,
      setLastCityId: (id) => set({ lastCityId: id }),
    }),
    { name: "weather-city" }
  )
);
