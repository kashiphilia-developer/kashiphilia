"use client";

import { useFavorites } from "@/lib/favorites";
import type { Spot } from "@/lib/types";
import { useSession } from "next-auth/react";

export default function StarButton({ spot, className = "" }: { spot: Spot; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const { status } = useSession();
  const isAuthed = status === "authenticated";
  const on = isFavorite(spot.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(spot);
      }}
      aria-label={on ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        on
          ? "border-amber-300 bg-amber-50 text-amber-700"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {on ? "Saved" : isAuthed ? "Star" : "Star (local)"}
    </button>
  );
}
