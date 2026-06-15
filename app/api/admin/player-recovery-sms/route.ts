import { NextRequest, NextResponse } from "next/server";
import { generateRecoverySmsCopy } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        player_id?: string;
      }
    | null;

  const playerId = body?.player_id?.trim();

  if (!playerId) {
    return NextResponse.json({ ok: false, error: "player_id is required." }, { status: 400 });
  }

  const result = await generateRecoverySmsCopy({ player_id: playerId });

  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}
