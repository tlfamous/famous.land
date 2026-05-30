import { NextRequest, NextResponse } from "next/server";
import { guestAssignments } from "@/app/july2026/data";
import { bindJulyGuestLink } from "@/lib/july2026GuestLinks";

export const runtime = "nodejs";

function isKnownGuest(slug: string) {
  return guestAssignments.some((guest) => guest.slug === slug);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { slug?: string; token?: string; device_id?: string }
    | null;

  if (!body?.slug || !isKnownGuest(body.slug)) {
    return NextResponse.json({ ok: false, error: "Known guest slug is required." }, { status: 400 });
  }

  if (!body.device_id) {
    return NextResponse.json({ ok: false, error: "device_id is required." }, { status: 400 });
  }

  const result = await bindJulyGuestLink({
    slug: body.slug,
    token: body.token,
    device_id: body.device_id
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
