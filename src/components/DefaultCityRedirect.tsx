"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCityStore } from "@/lib/cityStore";
import { CITIES } from "@/lib/cities";

export function DefaultCityRedirect() {
  const router = useRouter();
  const cityParam = useSearchParams().get("city");
  const lastCityId = useCityStore((s) => s.lastCityId);
  const setLastCityId = useCityStore((s) => s.setLastCityId);

  useEffect(() => {
    if (!cityParam) {
      const validCity = CITIES.find((c) => c.id === lastCityId);
      const safeId = validCity ? lastCityId : CITIES[0].id;
      if (!validCity) setLastCityId(CITIES[0].id);
      router.replace(`/?city=${safeId}`);
    }
  }, [cityParam, lastCityId, setLastCityId, router]);

  return null;
}
