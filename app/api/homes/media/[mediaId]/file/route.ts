import { NextResponse } from "next/server";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import { readHomesObject, validateGuideImage } from "@/lib/property-ops/object-storage";
import { getHomeMedia } from "@/lib/property-ops";

type RouteContext = { params: Promise<{ mediaId: string }> };

const PRIVATE_FILE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Content-Type-Options": "nosniff"
};

function notFound() {
  return NextResponse.json(
    { ok: false, error: { code: "MEDIA_NOT_FOUND", message: "Image not found." } },
    { status: 404, headers: PRIVATE_FILE_HEADERS }
  );
}

function safeInlineName(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[^\x20-\x7e]+/g, "-")
      .replace(/["\\/;\r\n]+/g, "-")
      .trim()
      .slice(0, 160) || "house-image.jpg"
  );
}

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await authorizeAdminRequest(request);
  if (!auth.ok) return auth.response;

  const { mediaId } = await params;
  if (!mediaId || mediaId.length > 100) return notFound();

  try {
    const media = await getHomeMedia(mediaId);
    if (
      !media ||
      media.metadataStripped !== true ||
      (media.mediaType !== "image/jpeg" && media.mediaType !== "image/webp")
    ) {
      return notFound();
    }

    const object = await readHomesObject({
      key: media.r2ObjectKey,
      homeId: media.homeId,
      kind: "media"
    });
    if (!object) return notFound();

    const validated = await validateGuideImage(
      new File([object.body], media.fileName, { type: media.mediaType })
    );
    if (
      (media.width !== undefined && validated.width !== media.width) ||
      (media.height !== undefined && validated.height !== media.height)
    ) {
      return notFound();
    }

    return new Response(object.body, {
      status: 200,
      headers: {
        ...PRIVATE_FILE_HEADERS,
        "Content-Type": media.mediaType,
        "Content-Length": String(object.byteSize),
        "Content-Disposition": `inline; filename="${safeInlineName(media.fileName)}"`
      }
    });
  } catch (error) {
    console.error("Homes media read failed", error);
    return notFound();
  }
}
