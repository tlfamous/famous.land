import { NextRequest, NextResponse } from "next/server";
import { saveProgress } from "@/lib/db";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { player_id?: string; email?: string; marker_ids?: string[] }
    | null;

  if (!body?.player_id || !body.email) {
    return NextResponse.json(
      { ok: false, error: "player_id and email are required." },
      { status: 400 }
    );
  }

  if (!emailPattern.test(body.email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  const result = await saveProgress({
    player_id: body.player_id,
    email: body.email,
    marker_ids: body.marker_ids ?? [],
    user_agent: request.headers.get("user-agent") ?? undefined
  });

  return NextResponse.json({
    ok: true,
    ...result,
    message:
      "Progress saved. Email sending is stubbed until an email provider is connected."
  });
}
