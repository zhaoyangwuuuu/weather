"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCityStore } from "@/lib/cityStore";
import { CITIES } from "@/lib/cities";

export function DefaultCityRedirect() {
  const router = useRouter();
  const cityParam = useSearchParams().get("city");
  const lastCitySlug = useCityStore((s) => s.lastCitySlug);
  const setLastCitySlug = useCityStore((s) => s.setLastCitySlug);

  useEffect(() => {
    if (!cityParam) {
      const validCity = CITIES.find((c) => c.slug === lastCitySlug);
      const safeSlug = validCity ? lastCitySlug : CITIES[0].slug;
      if (!validCity) setLastCitySlug(CITIES[0].slug);
      router.replace(`/?city=${safeSlug}`);
    }
  }, [cityParam, lastCitySlug, setLastCitySlug, router]);

  return null;
}
