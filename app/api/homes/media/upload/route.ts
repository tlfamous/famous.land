import { NextResponse } from "next/server";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import {
  deleteHomesObject,
  storeHomesObject,
  validateGuideImage
} from "@/lib/property-ops/object-storage";
import { createHomeMedia, getHome } from "@/lib/property-ops";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

function textField(form: FormData, name: string, maximum: number) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function uploadFile(form: FormData) {
  const value = form.get("file");
  if (!(value instanceof File) || value.size === 0) {
    throw new Error("Choose a processed image to upload.");
  }
  return value;
}

function safeFileName(value: string, extension: "jpg" | "webp") {
  const stem = value
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0000-\u001f\u007f/\\]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
  return `${stem || "house-image"}.${extension}`;
}

function badRequest(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_MEDIA_UPLOAD", message } },
    { status: 400, headers: NO_STORE_HEADERS }
  );
}

export async function POST(request: Request) {
  const auth = await authorizeAdminRequest(request, { mutation: true });
  if (!auth.ok) return auth.response;

  let storedKey: string | undefined;

  try {
    const form = await request.formData();
    const homeId = textField(form, "homeId", 100);
    if (!homeId || !(await getHome(homeId))) return badRequest("Choose a valid home.");

    const file = uploadFile(form);
    const image = await validateGuideImage(file);
    const title = textField(form, "title", 160);
    if (!title) return badRequest("Image title is required.");

    const visibility = textField(form, "visibility", 20) || "private";
    if (visibility !== "private" && visibility !== "guide") {
      return badRequest("Image visibility must be private or guide-visible.");
    }

    const altText = textField(form, "altText", 500) || undefined;
    const fileName = safeFileName(file.name, image.extension);
    const stored = await storeHomesObject({
      homeId,
      kind: "media",
      extension: image.extension,
      bytes: image.bytes,
      contentType: image.mediaType,
      originalFileName: fileName
    });
    storedKey = stored.key;

    const media = await createHomeMedia(
      homeId,
      {
        title,
        altText,
        r2ObjectKey: stored.key,
        fileName,
        mediaType: image.mediaType,
        byteSize: stored.byteSize,
        width: image.width,
        height: image.height,
        visibility,
        metadataStripped: true,
        processedAt: new Date().toISOString()
      },
      { adminSessionId: auth.session.id }
    );

    return NextResponse.json({ ok: true, media }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (storedKey) {
      try {
        await deleteHomesObject(storedKey);
      } catch (cleanupError) {
        console.error("Failed to remove orphaned homes media object", cleanupError);
      }
    }

    const message = error instanceof Error ? error.message : "Image upload failed.";
    const isValidationError = /^(The image|Processed images|Image metadata|Choose a processed)/i.test(
      message
    );
    if (isValidationError) return badRequest(message);

    console.error("Homes media upload failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "MEDIA_UPLOAD_FAILED", message: "The image could not be stored." }
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
