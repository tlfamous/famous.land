import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/July2026" || pathname.startsWith("/July2026/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/July2026", "/july2026");
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/July2026", "/July2026/:path*"]
};
