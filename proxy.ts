import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/July2026" || pathname.startsWith("/July2026/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/july2026${pathname.slice("/July2026".length)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

