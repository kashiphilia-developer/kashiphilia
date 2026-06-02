"use client";

import { useCallback, useEffect, useState } from "react";
import SearchBox from "@/components/SearchBox";
import SpotCard from "@/components/SpotCard";
import MapLoader from "@/components/MapLoader";
import type { Spot, GeocodeResult } from "@/lib/types";
import { getTopSpots } from "@/lib/spots";

type Status = "idle" | "locating" | "searching" | "ready" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ lat: number; lon: number } | null>(null);
  const [source, setSource] = useState<string>("");
  const [spots, setSpots] = useState<Spot[]>([]);
  const [locationLabel, setLocationLabel] = useState("");

  const fetchSpots = useCallback(async (lat: number, lon: number, label: string) => {
    setStatus("searching");
    setError(null);
    try {
      const { spots, source } = await getTopSpots(lat, lon, 10, 5);
      setSpots(spots);
      setSource(source);
      setUser({ lat, lon });
      setLocationLabel(label);
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setError("Couldn't fetch nearby spots. Please try again.");
      setStatus("error");
    }
  }, []);

  const useMyLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("Your browser doesn't support geolocation.");
      setStatus("error");
      return;
    }
    setStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchSpots(latitude, longitude, "Your current location");
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Use the search bar instead."
            : `Couldn't get your location (${err.message}).`,
        );
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }, [fetchSpots]);

  const onSearch = useCallback(
    (r: GeocodeResult) => {
      const first = r.displayName.split(",")[0] || r.displayName;
      fetchSpots(r.lat, r.lon, first);
    },
    [fetchSpots],
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Kashiphilia
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Discover tourist spots within 10 km of any place.
        </p>
      </header>

      <div className="space-y-2">
        <SearchBox onPick={onSearch} />
        <button
          type="button"
          onClick={useMyLocation}
          className="btn-secondary w-full"
          disabled={status === "locating"}
        >
          <PinIcon className="h-4 w-4" />
          {status === "locating" ? "Finding you…" : "Use my current location"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">{locationLabel}</span>
              <span className="text-xs text-slate-500">Within 10 km</span>
            </div>
            <MapLoader user={user} spots={spots} />
            <p className="mt-2 text-[11px] text-slate-500">
              {source === "overpass" && "Data from OpenStreetMap."}
              {source === "overpass+curated" && "Mix of OpenStreetMap and featured landmarks."}
              {source === "curated" && "Featured landmarks only (no live data for this area)."}
            </p>
          </div>

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Top 5 nearby
            </h2>
            {spots.length === 0 ? (
              <p className="card p-4 text-sm text-slate-600">
                No tourist spots found within 10 km of this location.
              </p>
            ) : (
              <div className="space-y-2">
                {spots.map((s, i) => (
                  <SpotCard key={s.id} spot={s} index={i} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {status === "idle" && (
        <div className="card p-4 text-sm text-slate-600">
          Tap <strong>Use my current location</strong> or search a place above to begin.
        </div>
      )}
    </div>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
