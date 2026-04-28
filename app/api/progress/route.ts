import { NextRequest, NextResponse } from "next/server";
import { getProgress } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
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
