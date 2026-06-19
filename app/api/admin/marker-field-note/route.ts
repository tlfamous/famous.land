import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { updateMarkerFieldNote } from "@/lib/db";
import { markers } from "@/lib/markers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        marker_id?: string;
        field_note?: string;
      }
    | null;

  const markerId = body?.marker_id?.trim();
  const fieldNote = body?.field_note;

  if (!markerId) {
    return NextResponse.json({ ok: false, error: "Choose a marker first." }, { status: 400 });
  }

  if (typeof fieldNote !== "string" || !fieldNote.trim()) {
    return NextResponse.json({ ok: false, error: "Field note cannot be blank." }, { status: 400 });
  }

  try {
    const marker = await updateMarkerFieldNote(markerId, fieldNote);
    const staticMarker = markers.find((item) => item.marker_id === markerId);

    revalidatePath("/test");
    revalidatePath("/couch");

    if (staticMarker) {
      revalidatePath(`/${staticMarker.short_code}`);
      revalidatePath(`/t/${staticMarker.marker_id}`);
    }

    return NextResponse.json({ ok: true, marker });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Field note could not be saved."
      },
      { status: 400 }
    );
  }
}
