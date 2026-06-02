import { fetchNearbySpots } from "./overpass";
import { findCuratedSpotsNear } from "./curated";
import type { Spot } from "./types";

/**
 * Tries Overpass first, then merges in any nearby curated spots the
 * Overpass result is missing. Always returns at most `limit` results.
 */
export async function getTopSpots(
  lat: number,
  lon: number,
  radiusKm = 10,
  limit = 5,
  signal?: AbortSignal,
): Promise<{ spots: Spot[]; source: "overpass" | "overpass+curated" | "curated" }> {
  const overpass = await fetchNearbySpots(lat, lon, radiusKm, limit, signal).catch(() => []);
  const curated = findCuratedSpotsNear(lat, lon, radiusKm, limit);

  if (overpass.length === 0) {
    return { spots: curated, source: "curated" };
  }
  // Merge: keep all overpass, fill missing slots with curated (deduped by name).
  const seen = new Set(overpass.map((s) => s.name.toLowerCase()));
  const merged = [...overpass];
  for (const c of curated) {
    if (merged.length >= limit) break;
    if (!seen.has(c.name.toLowerCase())) {
      merged.push(c);
      seen.add(c.name.toLowerCase());
    }
  }
  merged.sort((a, b) => a.distanceKm - b.distanceKm);
  return { spots: merged.slice(0, limit), source: curated.length ? "overpass+curated" : "overpass" };
}
