import { NextRequest, NextResponse } from "next/server";
import { getGameAvailability, getProgress } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const availability = await getGameAvailability();

  if (!availability.enabled) {
    return NextResponse.json(
      { ok: false, error: "The Famous Land game is currently off." },
      { status: 503 }
    );
  }

  const playerId = request.nextUrl.searchParams.get("player_id");

  if (!playerId) {
    return NextResponse.json({ ok: false, error: "player_id is required." }, { status: 400 });
  }

  const progress = await getProgress(playerId);

  return NextResponse.json({
    ok: true,
    ...progress
  });
}
