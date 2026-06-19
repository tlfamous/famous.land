import { NextResponse } from "next/server";

const julyAdminCookieName = "july2026_admin_auth";
const julyAdminCookieValue = "july2026-admin-ImFamous";
const julyAdminPassword = "ImFamous";
const thirtyDaysInSeconds = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;

  if (body?.password !== julyAdminPassword) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    httpOnly: true,
    maxAge: thirtyDaysInSeconds,
    name: julyAdminCookieName,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: julyAdminCookieValue
  });

  return response;
}
