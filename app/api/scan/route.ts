import { NextRequest, NextResponse } from "next/server";
import { recordScan } from "@/lib/db";
import { getMarkerById } from "@/lib/markers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { player_id?: string; marker_id?: string }
    | null;

  if (!body?.player_id || !body.marker_id) {
    return NextResponse.json(
      { ok: false, error: "player_id and marker_id are required." },
      { status: 400 }
    );
  }

  const marker = getMarkerById(body.marker_id);
  if (!marker) {
    return NextResponse.json({ ok: false, error: "Unknown marker." }, { status: 404 });
  }

  const result = await recordScan({
    player_id: body.player_id,
    marker_id: marker.marker_id,
    user_agent: request.headers.get("user-agent") ?? undefined
  });

  return NextResponse.json({
    ok: true,
    is_new: result.is_new,
    scan: result.scan
  });
}
