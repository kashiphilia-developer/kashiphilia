export type Spot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  category: string;
  description?: string;
  wikipedia?: string;
  distanceKm: number;
  /** A short 30-word friendly summary */
  summary: string;
  /** Why it's famous (one or two short sentences) */
  famousFor: string;
  /** Longer backstory for the "more history" expand */
  backstory: string;
  /** True when this came from our curated dataset rather than OSM */
  curated?: boolean;
};

export type GeocodeResult = {
  displayName: string;
  lat: number;
  lon: number;
  type?: string;
};
