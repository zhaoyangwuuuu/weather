"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CITIES } from "@/lib/cities";
import { useCityStore } from "@/lib/cityStore";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("city") ?? "";
  const setLastCitySlug = useCityStore((s) => s.setLastCitySlug);

  useEffect(() => {
    if (selectedSlug) setLastCitySlug(selectedSlug);
  }, [selectedSlug, setLastCitySlug]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    if (slug) router.push(`/?city=${slug}`);
  }

  return (
    <select
      className="select select-bordered w-full max-w-lg"
      value={selectedSlug}
      onChange={handleChange}
      aria-label="Select city"
    >
      <option value="" disabled>Select a city...</option>
      {CITIES.map((city) => (
        <option key={city.slug} value={city.slug}>
          {city.name}, {city.country}
        </option>
      ))}
    </select>
  );
}
