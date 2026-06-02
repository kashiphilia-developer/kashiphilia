import type { GeocodeResult } from "./types";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const USER_AGENT = "Kashiphilia/0.1 (tourist-spot-finder)";

/**
 * Search Nominatim for places matching the query. Returns up to `limit` results.
 * Nominatim usage policy: max 1 request/second, must identify via User-Agent.
 */
export async function searchPlaces(
  query: string,
  limit = 5,
  signal?: AbortSignal,
): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];
  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("dedupe", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Geocoder error: ${res.status}`);
  const data: Array<{ lat: string; lon: string; display_name: string; type?: string }> =
    await res.json();
  return data.map((d) => ({
    displayName: d.display_name,
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
    type: d.type,
  }));
}
