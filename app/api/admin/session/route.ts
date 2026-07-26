import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  attachAdminSessionCookie,
  clearAdminSessionCookies,
  normalizeAdminNextPath,
  revokeAdminRequestSession,
  signInAdmin
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const originDenied = assertSameOrigin(request);
  if (originDenied) return originDenied;

  const body = (await request.json().catch(() => null)) as
    | { password?: string; next?: string }
    | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const next = normalizeAdminNextPath(body?.next);
  const result = await signInAdmin(request, password);

  if (!result.ok) {
    if (result.reason === "blocked") {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "LOGIN_BLOCKED", message: "Too many attempts. Try again later." }
        },
        {
          status: 429,
          headers: {
            "Cache-Control": "private, no-store",
            "Retry-After": String(result.retryAfterSeconds)
          }
        }
      );
    }

    if (result.reason === "unavailable") {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "AUTH_UNAVAILABLE", message: "Admin sign-on is temporarily unavailable." }
        },
        { status: 503, headers: { "Cache-Control": "private, no-store" } }
      );
    }

    return NextResponse.json(
      { ok: false, error: { code: "INVALID_PASSWORD", message: "Incorrect password." } },
      { status: 401, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const response = NextResponse.json(
    { ok: true, next },
    { headers: { "Cache-Control": "private, no-store" } }
  );
  attachAdminSessionCookie(response, request, result.token);
  return response;
}

export async function DELETE(request: Request) {
  const originDenied = assertSameOrigin(request);
  if (originDenied) return originDenied;

  await revokeAdminRequestSession(request);
  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store" } }
  );
  clearAdminSessionCookies(response, request);
  return response;
}
