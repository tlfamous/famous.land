import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import {
  attachAdminSessionCookie,
  createTrustedAdminSession,
  normalizeAdminNextPath
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RuntimeEnv = {
  FAMOUS_ADMIN_SSO_SECRET?: string;
  FAMOUS_ADMIN_SSO_URL?: string;
};

async function ssoConfig() {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as RuntimeEnv;
    return {
      secret: env.FAMOUS_ADMIN_SSO_SECRET,
      baseUrl: env.FAMOUS_ADMIN_SSO_URL
    };
  } catch {
    return {
      secret: process.env.FAMOUS_ADMIN_SSO_SECRET,
      baseUrl: process.env.FAMOUS_ADMIN_SSO_URL
    };
  }
}

function signInRedirect(request: Request, nextPath: string) {
  return NextResponse.redirect(
    new URL(`/sign-in?next=${encodeURIComponent(nextPath)}`, request.url),
    303
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = normalizeAdminNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const config = await ssoConfig();

  if (!code || !config.secret) return signInRedirect(request, nextPath);

  const redeemUrl = new URL(
    "/api/sso/redeem",
    config.baseUrl || "https://admin.famous.land"
  );
  const redemption = await fetch(redeemUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-famous-admin-sso-secret": config.secret
    },
    body: JSON.stringify({ projectId: projectIdForNextPath(nextPath), code }),
    cache: "no-store"
  }).catch(() => null);

  if (!redemption?.ok) return signInRedirect(request, nextPath);

  const session = await createTrustedAdminSession();
  if (!session.ok) return signInRedirect(request, nextPath);

  const response = NextResponse.redirect(new URL(nextPath, request.url), 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  attachAdminSessionCookie(response, request, session.token);
  return response;
}

function projectIdForNextPath(nextPath: string) {
  if (nextPath === "/homes" || nextPath.startsWith("/homes/")) return "homes";
  if (nextPath === "/july2026/admin" || nextPath.startsWith("/july2026/admin/")) {
    return "events";
  }
  return "quest";
}
