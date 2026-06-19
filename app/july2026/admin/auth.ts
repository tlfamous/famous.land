import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const julyAdminCookieName = "july2026_admin_auth";
export const julyAdminCookieValue = "july2026-admin-ImFamous";
export const julyAdminPassword = "ImFamous";

export async function isJulyAdminSignedIn() {
  const cookieStore = await cookies();

  return cookieStore.get(julyAdminCookieName)?.value === julyAdminCookieValue;
}

export async function requireJulyAdmin(nextPath = "/july2026/admin") {
  if (await isJulyAdminSignedIn()) {
    return;
  }

  redirect(`/july2026/admin/sign-in?next=${encodeURIComponent(nextPath)}`);
}

export async function requireJulyAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const hasAdminCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie === `${julyAdminCookieName}=${julyAdminCookieValue}`);

  if (hasAdminCookie) {
    return null;
  }

  const signInUrl = new URL("/july2026/admin/sign-in", request.url);
  signInUrl.searchParams.set("next", new URL(request.url).pathname);

  return Response.redirect(signInUrl, 302);
}
