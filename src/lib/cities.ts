export const CITIES = [
  { slug: "toronto", id: 6167865, name: "Toronto", country: "CA", lat: 43.7001, lon: -79.4163 },
  { slug: "ottawa",  id: 6094817, name: "Ottawa",  country: "CA", lat: 45.4215, lon: -75.6972 },
  { slug: "tokyo",   id: 1850147, name: "Tokyo",   country: "JP", lat: 35.6762, lon: 139.6503 },
] as const;

export type City = (typeof CITIES)[number];
