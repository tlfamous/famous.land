import { NextRequest, NextResponse } from "next/server";
import { guestAssignments } from "@/app/july2026/data";
import {
  listJulyGuestLinks,
  regenerateJulyGuestLink,
  resetJulyGuestBinding
} from "@/lib/july2026GuestLinks";

export const runtime = "nodejs";

function isKnownGuest(slug: string) {
  return guestAssignments.some((guest) => guest.slug === slug);
}

export async function GET() {
  const links = await listJulyGuestLinks();

  return NextResponse.json({
    ok: true,
    links: links.map((link) => ({
      ...link,
      bound: Boolean(link.bound_at)
    }))
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { action?: string; slug?: string }
    | null;

  if (!body?.slug || !isKnownGuest(body.slug)) {
    return NextResponse.json({ ok: false, error: "Known guest slug is required." }, { status: 400 });
  }

  if (body.action === "regenerate") {
    const link = await regenerateJulyGuestLink(body.slug);
    return NextResponse.json({ ok: true, link });
  }

  if (body.action === "reset") {
    const link = await resetJulyGuestBinding(body.slug);
    return NextResponse.json({ ok: true, link });
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
