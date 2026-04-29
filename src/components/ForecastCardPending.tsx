"use client";
import { useLinkStatus } from "next/link";

export function ForecastCardPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`loading loading-spinner loading-xs absolute bottom-1 right-1 transition-opacity ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
