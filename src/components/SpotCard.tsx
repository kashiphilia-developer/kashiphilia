"use client";

import Link from "next/link";
import type { Spot } from "@/lib/types";
import StarButton from "./StarButton";

export default function SpotCard({ spot, index }: { spot: Spot; index: number }) {
  return (
    <Link
      href={`/spot/${encodeURIComponent(spot.id)}?lat=${spot.lat}&lon=${spot.lon}`}
      className="card flex items-start gap-3 p-3 transition hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold text-slate-800">{spot.name}</h3>
          <span className="text-xs text-slate-500">
            {spot.distanceKm.toFixed(1)} km
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="chip">{spot.category}</span>
          {spot.curated && <span className="chip">Featured</span>}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{spot.summary}</p>
        <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <StarButton spot={spot} />
        </div>
      </div>
    </Link>
  );
}
