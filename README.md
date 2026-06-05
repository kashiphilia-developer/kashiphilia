# Kashiphilia

Mobile-friendly Next.js app for discovering tourist spots near any location with summaries, audio narration, and saved favorites.

## Features

1. **Use my location** — `navigator.geolocation` → top 5 spots within 10 km.
2. **Search any place** — Nominatim autocomplete, then top 5 spots within 10 km of the picked place.
3. **30-word summary + "why famous"** on each spot's detail page.
4. **Play 5-min audio** — long-form narration (intro + summary + famous-for + backstory) via the browser's Web Speech API. Pause / resume / stop controls.
5. **More history** expand-and-collapse for the longer backstory.
6. **Star / save** — works for guests via `localStorage`; log in to sync across devices (NextAuth + SQLite + Prisma).
7. **Saved tab** lists your favourites.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Leaflet (via `react-leaflet`, dynamic import for SSR)
- OpenStreetMap tiles + Nominatim geocoder + Overpass API for nearby POIs
- Curated dataset (8 famous landmarks) as a fallback when OSM has no data
- NextAuth Credentials provider with JWT sessions
- Prisma + SQLite for users / favourites

## Getting started

```bash
npm install --legacy-peer-deps
npx prisma migrate dev --name init
npm run dev
```

Open <http://localhost:3000>.

### Environment

`.env`:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="change-me-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## Project layout

- `src/app/page.tsx` — Discover (search + geolocation + map + top 5 list)
- `src/app/spot/[id]/page.tsx` — Spot detail (summary, audio, more history)
- `src/app/favorites/page.tsx` — Saved spots
- `src/app/account/page.tsx` & `src/app/signin/page.tsx` — Auth
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler
- `src/app/api/auth/register/route.ts` — User registration
- `src/app/api/favorites/route.ts` — List/add/remove favourites (auth required)
- `src/lib/overpass.ts` — Overpass API + curated fallback
- `src/lib/geocode.ts` — Nominatim search
- `src/lib/curated.ts` — 8 famous landmarks
- `src/lib/favorites.tsx` — Guest + auth-aware favourites context
- `src/lib/useNarration.ts` — Web Speech API wrapper

## Architecture documentation

- See `ARCHITECTURE.md` for a high-level architecture overview, sequence diagrams, API route details, external service usage, and database schema.

## Notes / limitations

- The browser's Web Speech API gives robotic audio. Swap `useNarration` for a server-side TTS (ElevenLabs / OpenAI) to upgrade voice quality.
- The 30-word summary for OSM data is currently derived from the `description` tag if present, otherwise a generic placeholder. A future improvement is to call an LLM to summarise a Wikipedia blurb.
- The dev server is running at <http://localhost:3000> in the background; stop it with `TaskStop`.
