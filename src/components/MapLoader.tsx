"use client";

import dynamic from "next/dynamic";

// react-leaflet can't SSR, so we load it client-side only.
const Map = dynamic(() => import("@/components/SpotsMap"), { ssr: false });
export default Map;
