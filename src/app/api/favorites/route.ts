import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Spot } from "@/lib/types";

type FavoriteRow = {
  spotId: string;
  spotName: string;
  spotLat: number;
  spotLon: number;
  createdAt: Date;
};

function rowToSpot(row: FavoriteRow): Spot {
  return {
    id: row.spotId,
    name: row.spotName,
    lat: row.spotLat,
    lon: row.spotLon,
    category: "Saved",
    summary: "Saved from your earlier session.",
    famousFor: "Saved to your list.",
    backstory: "",
    distanceKm: 0,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ favorites: [] });
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ favorites: rows.map(rowToSpot) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId)
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const raw = await req.json();
  // accept either the current Spot shape (id,name,lat,lon)
  // or legacy payloads using spotId/spotName/spotLat/spotLon
  const body = (raw || {}) as Partial<Spot> & {
    spotId?: string;
    spotName?: string;
    spotLat?: number;
    spotLon?: number;
  };
  const id = body.id ?? body.spotId;
  const name = body.name ?? body.spotName;
  const lat = body.lat ?? body.spotLat;
  const lon = body.lon ?? body.spotLon;
  if (!id || !name || lat == null || lon == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    await prisma.favorite.upsert({
      where: { userId_spotId: { userId, spotId: id } },
      create: {
        userId,
        spotId: id,
        spotName: name,
        spotLat: lat,
        spotLon: lon,
      },
      update: {},
    });
  } catch (e) {
    console.error("Favorite POST failed", e);
    return NextResponse.json({ error: "Couldn't save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId)
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const body = (await req.json()) as { spotId?: string };
  if (!body.spotId)
    return NextResponse.json({ error: "Missing spotId" }, { status: 400 });
  await prisma.favorite.deleteMany({ where: { userId, spotId: body.spotId } });
  return NextResponse.json({ ok: true });
}
