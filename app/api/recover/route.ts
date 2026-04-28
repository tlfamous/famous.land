import { NextRequest, NextResponse } from "next/server";
import { requestRecovery } from "@/lib/db";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; recovery_code?: string }
    | null;

  if (!body?.email) {
    return NextResponse.json({ ok: false, error: "email is required." }, { status: 400 });
  }

  if (!emailPattern.test(body.email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  const result = await requestRecovery({
    email: body.email,
    recovery_code: body.recovery_code?.trim().toUpperCase() || undefined
  });

  return NextResponse.json({
    ok: true,
    ...result
  });
}
