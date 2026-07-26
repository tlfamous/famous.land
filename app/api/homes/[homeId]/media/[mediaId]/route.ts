import { authorizeAdminRequest } from "@/lib/adminAuth";
import {
  deleteHomeMedia,
  getHomeMedia,
  getPublishedGuide,
  upsertHomeMedia,
  type MediaVisibility
} from "@/lib/property-ops";
import { deleteHomesObject } from "@/lib/property-ops/object-storage";
import { homesError, homesJson, requestJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string; mediaId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;

  try {
    const { homeId, mediaId } = await context.params;
    const current = await getHomeMedia(mediaId);
    if (!current || current.homeId !== homeId) throw new Error("Media not found for this home.");
    const body = await requestJson<{
      title?: string;
      altText?: string;
      visibility?: MediaVisibility;
    }>(request);

    return homesJson(
      await upsertHomeMedia(
        homeId,
        {
          id: current.id,
          title: body.title ?? current.title,
          altText: body.altText ?? current.altText,
          r2ObjectKey: current.r2ObjectKey,
          fileName: current.fileName,
          mediaType: current.mediaType,
          byteSize: current.byteSize,
          width: current.width,
          height: current.height,
          visibility: body.visibility ?? current.visibility,
          metadataStripped: true,
          processedAt: current.processedAt
        },
        { adminSessionId: authorization.session.id }
      )
    );
  } catch (error) {
    return homesError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;

  try {
    const { homeId, mediaId } = await context.params;
    const media = await getHomeMedia(mediaId);
    if (!media || media.homeId !== homeId) throw new Error("Media not found for this home.");
    const publishedGuide = await getPublishedGuide(homeId);
    if (publishedGuide?.snapshot.media.some((item) => item.id === mediaId)) {
      throw new Error(
        "This image is used by the published guide. Make it private and publish the guide again before deleting it."
      );
    }

    await deleteHomeMedia(homeId, mediaId, {
      adminSessionId: authorization.session.id
    });
    try {
      await deleteHomesObject(media.r2ObjectKey);
    } catch (cleanupError) {
      console.error("Failed to remove deleted homes media object", cleanupError);
    }
    return homesJson({ id: mediaId });
  } catch (error) {
    return homesError(error);
  }
}
