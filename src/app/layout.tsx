import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Providers from "@/components/Providers";
import ThemeControls from "@/components/ThemeControls";

export const metadata: Metadata = {
  title: "Kashiphilia — Discover nearby heritage",
  description:
    "Find tourist spots near you, get a 30-word summary, and listen to a 5-min backstory audio guide.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-screen-md flex-col">
            <div
              className="border-b px-4 py-3 backdrop-blur sm:px-6"
              style={{
                background: "var(--panel)",
                borderColor: "var(--border)",
              }}
            >
              <div className="mx-auto flex max-w-screen-md items-center justify-between gap-4">
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Theme controls
                </p>
                <ThemeControls />
              </div>
            </div>
            <main className="flex-1 px-4 pb-24 pt-4 sm:px-6">{children}</main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
