"use client";

import { useEffect, useRef, useState } from "react";
import type { GeocodeResult } from "@/lib/types";
import { searchPlaces } from "@/lib/geocode";

export default function SearchBox({
  onPick,
}: {
  onPick: (g: GeocodeResult) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const r = await searchPlaces(q, 6, ctrl.signal);
        setResults(r);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          console.warn(e);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search a city or place…"
          className="input"
          aria-label="Search location"
        />
        <button
          className="btn-primary"
          disabled={!q.trim()}
          onClick={() => {
            if (results[0]) {
              onPick(results[0]);
              setOpen(false);
              setQ(results[0].displayName);
            }
          }}
        >
          Search
        </button>
      </div>
      {open && q.trim() && (
        <div className="thin-scroll absolute left-0 right-20 z-20 mt-1 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {loading && (
            <div className="px-3 py-2 text-sm text-slate-500">Searching…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-500">No matches.</div>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.lat}-${r.lon}-${i}`}
              type="button"
              onClick={() => {
                onPick(r);
                setOpen(false);
                setQ(r.displayName);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <div className="line-clamp-1 font-medium text-slate-800">
                {r.displayName.split(",")[0]}
              </div>
              <div className="line-clamp-1 text-xs text-slate-500">
                {r.displayName}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
