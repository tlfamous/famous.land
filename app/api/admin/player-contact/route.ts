import { NextRequest, NextResponse } from "next/server";
import { updatePlayerContact } from "@/lib/db";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        player_id?: string;
        email?: string;
        phone_number?: string;
      }
    | null;

  const playerId = body?.player_id?.trim();
  const email = body?.email?.trim();
  const phoneNumber = body?.phone_number?.trim();

  if (!playerId) {
    return NextResponse.json({ ok: false, error: "player_id is required." }, { status: 400 });
  }

  if (email && !emailPattern.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  const player = await updatePlayerContact({
    player_id: playerId,
    email: email || undefined,
    phone_number: phoneNumber || undefined
  });

  return NextResponse.json({
    ok: true,
    player
  });
}
