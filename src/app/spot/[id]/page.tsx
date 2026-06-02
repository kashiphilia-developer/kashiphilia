"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTopSpots } from "@/lib/spots";
import type { Spot } from "@/lib/types";
import AudioPlayer from "@/components/AudioPlayer";
import StarButton from "@/components/StarButton";
import { findCuratedSpotsNear } from "@/lib/curated";

export default function SpotDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const lat = search.get("lat");
  const lon = search.get("lon");
  const id = decodeURIComponent(params.id);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    async function load() {
      if (lat && lon) {
        try {
          const { spots } = await getTopSpots(parseFloat(lat), parseFloat(lon), 10, 5);
          const found = spots.find((s) => s.id === id);
          if (found) {
            setSpot(found);
            return;
          }
        } catch (e) {
          console.warn("Spots reload failed", e);
        }
      }
      // Fall back to the curated list (covers deep-links and offline reloads)
      const curated = findCuratedSpotsNear(0, 0, 20_000, 100);
      const found = curated.find((s) => s.id === id);
      if (found) {
        setSpot(found);
      } else {
        setError("We couldn't find this spot anymore.");
      }
    }
    load();
  }, [id, lat, lon]);

  const wikipediaUrl = useMemo(() => {
    if (!spot?.wikipedia) return null;
    const title = spot.wikipedia.replace(/^[a-z]{2}:/i, "");
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  }, [spot?.wikipedia]);

  if (error) {
    return (
      <div className="space-y-3">
        <Link href="/" className="btn-ghost">← Back</Link>
        <p className="card p-4 text-sm text-slate-600">{error}</p>
      </div>
    );
  }
  if (!spot) {
    return (
      <div className="space-y-3">
        <Link href="/" className="btn-ghost">← Back</Link>
        <div className="card p-4 text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/" className="btn-ghost">← Back</Link>

      <header>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {spot.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="chip">{spot.category}</span>
              {spot.curated && <span className="chip">Featured</span>}
              <span>{spot.distanceKm.toFixed(1)} km away</span>
            </div>
          </div>
          <StarButton spot={spot} />
        </div>
      </header>

      <section className="card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          In 30 words
        </h2>
        <p className="mt-1 text-slate-800">{spot.summary}</p>
        <p className="mt-3 text-sm text-slate-600">
          <strong>Why it's famous:</strong> {spot.famousFor}
        </p>
      </section>

      <AudioPlayer
        intro={`Welcome to ${spot.name}. Here's a 5-minute audio tour.`}
        summary={spot.summary}
        famousFor={spot.famousFor}
        backstory={spot.backstory}
      />

      <section className="card p-4">
        <button
          type="button"
          onClick={() => setShowMore((s) => !s)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            More history
          </span>
          <span className="text-slate-400">{showMore ? "−" : "+"}</span>
        </button>
        {showMore ? (
          <div className="mt-2 space-y-3 text-sm text-slate-700">
            <p>{spot.backstory}</p>
            {spot.description && (
              <p className="text-xs text-slate-500">{spot.description}</p>
            )}
            {wikipediaUrl && (
              <a
                className="text-xs font-medium text-brand-600 underline"
                href={wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read on Wikipedia ↗
              </a>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">Tap to expand a longer backstory.</p>
        )}
      </section>
    </div>
  );
}
