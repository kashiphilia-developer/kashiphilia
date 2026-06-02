"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites";
import { useSession } from "next-auth/react";

export default function FavoritesPage() {
  const { favorites, loading } = useFavorites();
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved spots</h1>
      {!isAuthed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You're saving locally on this device.{" "}
          <Link href="/account" className="font-semibold underline">
            Log in
          </Link>{" "}
          to sync across devices.
        </div>
      )}
      {loading ? (
        <p className="card p-4 text-sm text-slate-500">Loading…</p>
      ) : favorites.length === 0 ? (
        <p className="card p-4 text-sm text-slate-600">
          You haven't saved any spots yet. Tap the star on a spot's card to save it.
        </p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((s) => (
            <li key={s.id} className="card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/spot/${encodeURIComponent(s.id)}?lat=${s.lat}&lon=${s.lon}`}
                    className="block truncate font-semibold text-slate-800 hover:underline"
                  >
                    {s.name}
                  </Link>
                  <div className="text-xs text-slate-500">
                    {s.category} · {s.distanceKm.toFixed(1)} km
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{s.summary}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
