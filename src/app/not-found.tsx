import type { Metadata } from "next";
import { CITIES } from "@/lib/cities";

export const metadata: Metadata = {
  title: "404 – Not Found",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-base-content/60">That city could not be found.</p>
      {/* Use <a> not <Link> — notFound() boundaries don't unmount on soft navigation */}
      <a href={`/?city=${CITIES[0].slug}`} className="btn btn-primary">
        Back to Weather
      </a>
    </main>
  );
}
