"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CITIES } from "@/lib/cities";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("city") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (id) router.push(`/?city=${id}`);
  }

  return (
    <select
      className="select select-bordered w-full max-w-lg"
      value={selectedId}
      onChange={handleChange}
      aria-label="Select city"
    >
      <option value="" disabled>Select a city...</option>
      {CITIES.map((city) => (
        <option key={city.id} value={String(city.id)}>
          {city.name}, {city.country}
        </option>
      ))}
    </select>
  );
}
