import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Providers from "@/components/Providers";

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
      <body className="min-h-screen bg-slate-50">
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-screen-md flex-col">
            <main className="flex-1 px-4 pb-24 pt-4 sm:px-6">{children}</main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
