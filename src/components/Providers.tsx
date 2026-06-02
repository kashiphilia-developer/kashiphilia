"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { FavoritesProvider } from "@/lib/favorites";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </SessionProvider>
  );
}
