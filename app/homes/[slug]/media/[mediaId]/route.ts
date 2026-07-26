import {
  getPublishedGuideMediaBySlug,
  resolvePublishedHomeSlugRedirect
} from "@/lib/property-ops";
import { readHomesObject } from "@/lib/property-ops/object-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string; mediaId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug, mediaId } = await context.params;
    const media = await getPublishedGuideMediaBySlug(slug, mediaId);
    if (!media) {
      const redirectSlug = await resolvePublishedHomeSlugRedirect(slug);
      if (redirectSlug) {
        return Response.redirect(
          new URL(`/homes/${redirectSlug}/media/${encodeURIComponent(mediaId)}`, request.url),
          308
        );
      }
      return notFoundResponse();
    }
    if (media.mediaType !== "image/jpeg" && media.mediaType !== "image/webp") {
      return notFoundResponse();
    }
    const object = await readHomesObject({
      key: media.objectKey,
      homeId: media.homeId,
      kind: "media"
    });
    if (!object) return notFoundResponse();

    return new Response(object.body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Length": String(object.byteSize),
        "Content-Type": media.mediaType,
        "Content-Disposition": "inline",
        "Cross-Origin-Resource-Policy": "same-origin",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive"
      }
    });
  } catch {
    return notFoundResponse();
  }
}

function notFoundResponse() {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    }
  });
}
