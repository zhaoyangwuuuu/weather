"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function ScrollToForecast() {
  const day = useSearchParams().get("day");

  useEffect(() => {
    if (!day || window.innerWidth >= 640) return;

    const el = document.getElementById("hourly-detail");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Element not yet in DOM — WeatherResults is still suspended. Watch for it.
    const observer = new MutationObserver(() => {
      const target = document.getElementById("hourly-detail");
      if (target) {
        observer.disconnect();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [day]);

  return null;
}
