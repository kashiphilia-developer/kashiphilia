import type { Spot } from "./types";
import { CURATED_SPOTS, findCuratedSpotsNear, haversineKm } from "./curated";

const OVERPASS = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "Kashiphilia/0.1 (tourist-spot-finder)";

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = { elements: OverpassElement[] };

/**
 * Query the Overpass API for tourist attractions, historic sites, museums,
 * monuments, viewpoints, etc. within ~10km of the given coordinate.
 * Returns up to `limit` results, sorted by distance.
 */
export async function fetchNearbySpots(
  lat: number,
  lon: number,
  radiusKm = 10,
  limit = 5,
  signal?: AbortSignal,
): Promise<Spot[]> {
  const radius = Math.round(radiusKm * 1000);
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"attraction|museum|gallery|viewpoint|artwork|monument"](around:${radius},${lat},${lon});
      way["tourism"~"attraction|museum|gallery|viewpoint|artwork|monument"](around:${radius},${lat},${lon});
      node["historic"](around:${radius},${lat},${lon});
      way["historic"](around:${radius},${lat},${lon});
      node["amenity"="place_of_worship"]["historic"](around:${radius},${lat},${lon});
      way["amenity"="place_of_worship"]["historic"](around:${radius},${lat},${lon});
    );
    out center 30;
  `;
  try {
    const res = await fetch(OVERPASS, {
      method: "POST",
      body: new URLSearchParams({ data: query }).toString(),
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
    const data: OverpassResponse = await res.json();
    return normalise(data.elements, lat, lon, limit);
  } catch (e) {
    console.warn("Overpass request failed, using curated fallback:", e);
    return findCuratedSpotsNear(lat, lon, radiusKm, limit);
  }
}

function normalise(
  elements: OverpassElement[],
  lat: number,
  lon: number,
  limit: number,
): Spot[] {
  const seen = new Set<string>();
  const out: Spot[] = [];
  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags["name:en"];
    if (!name) continue;
    const p =
      el.lat !== undefined && el.lon !== undefined
        ? { lat: el.lat, lon: el.lon }
        : el.center;
    if (!p) continue;
    const id = `${el.type}/${el.id}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const distance = haversineKm(lat, lon, p.lat, p.lon);
    const category = pickCategory(tags);
    const description = tags.description || tags["description:en"];
    const wikipedia = tags.wikipedia;
    const summary = buildSummary(tags, category);
    const famousFor = buildFamousFor(tags, category);
    const backstory = buildBackstory(tags);

    out.push({
      id: `osm-${id}`,
      name,
      lat: p.lat,
      lon: p.lon,
      category,
      description,
      wikipedia,
      distanceKm: distance,
      summary,
      famousFor,
      backstory,
    });
  }
  out.sort((a, b) => a.distanceKm - b.distanceKm);
  return out.slice(0, limit);
}

function pickCategory(tags: Record<string, string>): string {
  if (tags.tourism) {
    const map: Record<string, string> = {
      attraction: "Attraction",
      museum: "Museum",
      gallery: "Gallery",
      viewpoint: "Viewpoint",
      artwork: "Artwork",
      monument: "Monument",
    };
    return map[tags.tourism] || "Attraction";
  }
  if (tags.historic) {
    const map: Record<string, string> = {
      castle: "Castle",
      ruins: "Ruins",
      monument: "Monument",
      memorial: "Memorial",
      archaeological_site: "Archaeological Site",
      church: "Church",
      temple: "Temple",
      mosque: "Mosque",
      palace: "Palace",
      tower: "Tower",
      fort: "Fort",
      city_gate: "City Gate",
    };
    return map[tags.historic] || "Historic";
  }
  return "Landmark";
}

function buildSummary(tags: Record<string, string>, category: string): string {
  if (tags.description || tags["description:en"]) {
    const d = (tags.description || tags["description:en"] || "").trim();
    return clampWords(d, 50);
  }
  return `A ${category.toLowerCase()} worth visiting nearby. Tap "More history" to learn more about its background.`;
}

function buildFamousFor(
  tags: Record<string, string>,
  category: string,
): string {
  if (tags.heritage) return `Recognised heritage site (${tags.heritage}).`;
  if (tags.wikidata)
    return `Listed on Wikidata — see linked source for more about its cultural importance.`;
  return `Locally known ${category.toLowerCase()} with cultural or historical value in the area.`;
}

function buildBackstory(tags: Record<string, string>): string {
  const parts: string[] = [];
  const cat = pickCategory(tags);

  // Build a more detailed narrative (aim for 100-150 words)
  parts.push(
    `This ${cat.toLowerCase()} is a notable site in the area. It is recorded in OpenStreetMap, a collaborative mapping database that documents landmarks, attractions, and historic locations worldwide.`,
  );

  if (tags.start_date || tags.built) {
    const date = tags.start_date || tags.built;
    parts.push(
      `The site dates back to ${date}, marking its place in local and regional history.`,
    );
  }

  if (tags.architect) {
    parts.push(
      `It was designed or built by ${tags.architect}, contributing to its architectural significance.`,
    );
  }

  if (tags.operator) {
    parts.push(
      `Currently operated by ${tags.operator}, ensuring its maintenance and public accessibility.`,
    );
  }

  if (tags.heritage || tags.wikidata) {
    if (tags.heritage) {
      parts.push(
        `This site holds recognized heritage status (${tags.heritage}), acknowledging its cultural and historical importance.`,
      );
    }
    if (tags.wikidata) {
      parts.push(
        `It is documented on Wikidata and other international databases, reflecting its significance.`,
      );
    }
  }

  if (tags.wikipedia) {
    const wiki = tags.wikipedia;
    const title = wiki.replace(/^[a-z]{2}:/i, "");
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    parts.push(`For comprehensive information, read more on Wikipedia: ${url}`);
  } else {
    parts.push(
      `Visitors are encouraged to explore this location in person to fully appreciate its characteristics and learn from local guides or information plaques on-site.`,
    );
  }

  return parts.join(" ");
}

function clampWords(s: string, n: number): string {
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length <= n) return s;
  return words.slice(0, n).join(" ") + "…";
}
