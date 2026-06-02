"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Spot } from "@/lib/types";
import Link from "next/link";

const markerIcon = L.divIcon({
  className: "user-marker",
  html: '<div style="width:16px;height:16px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px #2563eb40"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const spotIcon = (n: number) =>
  L.divIcon({
    className: "spot-marker",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:#0f172a;color:#fff;border-radius:50%;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2)">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

export default function SpotsMap({
  user,
  spots,
}: {
  user: { lat: number; lon: number } | null;
  spots: Spot[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center = user ? [user.lat, user.lon] : [20, 0];
    const map = L.map(containerRef.current, {
      center: center as [number, number],
      zoom: user ? 12 : 2,
      scrollWheelZoom: true,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    // Invalidate after a tick so the map sizes correctly inside flex layouts
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const points: [number, number][] = [];
    if (user) {
      L.marker([user.lat, user.lon], { icon: markerIcon })
        .bindTooltip("You are here", { direction: "top" })
        .addTo(layer);
      points.push([user.lat, user.lon]);
    }
    spots.forEach((s, i) => {
      const m = L.marker([s.lat, s.lon], { icon: spotIcon(i + 1) });
      m.bindPopup(
        `<div style="min-width:160px"><strong>${escape(s.name)}</strong><br/>` +
          `<small>${s.category} · ${s.distanceKm.toFixed(1)} km</small><br/>` +
          `<a href="/spot/${encodeURIComponent(s.id)}" data-spot-id="${escape(s.id)}" class="popup-link">Open details →</a></div>`,
      );
      m.addTo(layer);
      points.push([s.lat, s.lon]);
    });
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points).pad(0.2));
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    }
  }, [user, spots]);

  return (
    <div
      ref={containerRef}
      className="h-72 w-full overflow-hidden rounded-2xl border border-slate-200"
    />
  );
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
