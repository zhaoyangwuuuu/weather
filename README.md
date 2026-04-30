# Weather

A city weather app built with Next.js 16, DaisyUI, and the OpenWeatherMap API. Shows current conditions, a 5-day forecast, and 3-hour hourly breakdowns in local time.

## Tech stack

- **Next.js 16** — App Router, React Server Components, View Transitions
- **Tailwind v4 + DaisyUI v5** — styling
- **Zustand** — persists last selected city across sessions
- **Vitest + React Testing Library** — unit tests
- **OpenWeatherMap** — free tier API (current weather + 5-day/3-hour forecast)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the API key

Create a `.env` file at the project root:

```bash
cp .env.example .env
```

Then add your OpenWeatherMap API key:

```
OPENWEATHER_API_KEY=your_key_here
```

Get a free key at [openweathermap.org/api](https://openweathermap.org/api). The free tier supports current weather and 5-day forecast — no paid plan needed.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available cities

Toronto, Ottawa, Tokyo. Add more in `src/lib/cities.ts` — each entry needs a slug, OpenWeather city ID, name, country, and coordinates.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test:run` | Run all tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint |

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short imperative summary
```

Common types: `feat`, `fix`, `test`, `refactor`, `chore`, `perf`, `docs`.
Keep the subject under 72 characters and never include secret values.
