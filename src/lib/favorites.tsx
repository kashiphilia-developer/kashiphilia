"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { Spot } from "./types";

type FavoritesAPI = {
  favorites: Spot[];
  ids: Set<string>;
  isFavorite: (id: string) => boolean;
  toggle: (spot: Spot) => Promise<void>;
  loading: boolean;
};

const STORAGE_KEY = "kashiphilia.favorites.v1";
const FavoritesContext = createContext<FavoritesAPI | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const [favorites, setFavorites] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites — server for logged-in users, localStorage for guests.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        if (isAuthed) {
          const res = await fetch("/api/favorites", { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { favorites: Spot[] };
            if (!cancelled) setFavorites(data.favorites || []);
          }
        } else {
          const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
          const parsed = raw ? (JSON.parse(raw) as Spot[]) : [];
          if (!cancelled) setFavorites(parsed);
        }
      } catch (e) {
        console.warn("Favorites load failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  const persist = useCallback(
    async (next: Spot[]) => {
      setFavorites(next);
      if (isAuthed) {
        // Server is the source of truth; we don't keep a local copy in localStorage.
        return;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Favorites persist failed", e);
      }
    },
    [isAuthed],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const toggle = useCallback(
    async (spot: Spot) => {
      const exists = favorites.some((f) => f.id === spot.id);
      if (isAuthed) {
        const res = await fetch("/api/favorites", {
          method: exists ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotId: spot.id, spotName: spot.name, spotLat: spot.lat, spotLon: spot.lon }),
        });
        if (!res.ok) {
          console.warn("Favorites server toggle failed");
          return;
        }
      }
      const next = exists ? favorites.filter((f) => f.id !== spot.id) : [...favorites, spot];
      await persist(next);
    },
    [favorites, isAuthed, persist],
  );

  const value = useMemo<FavoritesAPI>(
    () => ({
      favorites,
      ids: new Set(favorites.map((f) => f.id)),
      isFavorite,
      toggle,
      loading,
    }),
    [favorites, isFavorite, toggle, loading],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
