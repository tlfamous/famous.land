import { getCloudflareContext } from "@opennextjs/cloudflare";

const MEDIA_MAX_BYTES = 8 * 1024 * 1024;
const MANUAL_MAX_BYTES = 20 * 1024 * 1024;
const MEDIA_MAX_DIMENSION = 2_400;
const MEDIA_MAX_PIXELS = MEDIA_MAX_DIMENSION * MEDIA_MAX_DIMENSION;

type R2PutOptions = {
  httpMetadata?: {
    contentType?: string;
    contentDisposition?: string;
  };
  customMetadata?: Record<string, string>;
};

type R2Bucket = {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView,
    options?: R2PutOptions
  ): Promise<unknown>;
  get(key: string): Promise<
    | {
        arrayBuffer(): Promise<ArrayBuffer>;
        size?: number;
      }
    | null
  >;
  delete(key: string): Promise<unknown>;
};

type ObjectStorageEnv = {
  HOMES_MEDIA?: R2Bucket;
};

export type ValidatedGuideImage = {
  bytes: Uint8Array;
  mediaType: "image/jpeg" | "image/webp";
  extension: "jpg" | "webp";
  width: number;
  height: number;
};

export type ValidatedManual = {
  bytes: Uint8Array;
  mediaType: "application/pdf";
  extension: "pdf";
};

export type StoredHomesObject = {
  key: string;
  byteSize: number;
};

export type HomesObjectBody = {
  body: ArrayBuffer;
  byteSize: number;
};

function safePathPart(value: string) {
  const normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (!normalized) throw new Error("A valid home identifier is required.");
  return normalized;
}

function hasPrefix(bytes: Uint8Array, prefix: number[]) {
  return prefix.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function containsAscii(bytes: Uint8Array, value: string) {
  if (!value || value.length > bytes.length) return false;
  const target = new TextEncoder().encode(value);

  outer: for (let offset = 0; offset <= bytes.length - target.length; offset += 1) {
    for (let index = 0; index < target.length; index += 1) {
      if (bytes[offset + index] !== target[index]) continue outer;
    }
    return true;
  }

  return false;
}

function readUint16(bytes: Uint8Array, offset: number) {
  return bytes[offset] * 256 + bytes[offset + 1];
}

function readUint24LittleEndian(bytes: Uint8Array, offset: number) {
  return bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65_536;
}

function readUint32LittleEndian(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] +
    bytes[offset + 1] * 256 +
    bytes[offset + 2] * 65_536 +
    bytes[offset + 3] * 16_777_216
  );
}

const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0,
  0xc1,
  0xc2,
  0xc3,
  0xc5,
  0xc6,
  0xc7,
  0xc9,
  0xca,
  0xcb,
  0xcd,
  0xce,
  0xcf
]);

function parseJpeg(bytes: Uint8Array) {
  if (!hasPrefix(bytes, [0xff, 0xd8, 0xff])) throw new Error("The image is not a valid JPEG.");
  if (bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9) {
    throw new Error("The JPEG is truncated.");
  }

  let offset = 2;
  let width = 0;
  let height = 0;
  let hasPrivateMetadata = false;

  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= bytes.length) throw new Error("The JPEG is truncated.");

    const segmentLength = readUint16(bytes, offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      throw new Error("The JPEG contains an invalid segment.");
    }

    // APP1 (EXIF/XMP), APP13 (IPTC), and comments can carry GPS or other
    // source-file information. Canvas derivatives should contain none of them.
    if (marker === 0xe1 || marker === 0xed || marker === 0xfe) {
      hasPrivateMetadata = true;
    }

    if (JPEG_START_OF_FRAME_MARKERS.has(marker)) {
      if (segmentLength < 7) throw new Error("The JPEG dimensions are invalid.");
      height = readUint16(bytes, offset + 3);
      width = readUint16(bytes, offset + 5);
    }

    offset += segmentLength;
  }

  if (!width || !height) throw new Error("The JPEG has no readable dimensions.");
  if (
    hasPrivateMetadata ||
    containsAscii(bytes, "Exif\u0000") ||
    containsAscii(bytes, "http://ns.adobe.com/xap") ||
    containsAscii(bytes, "<x:xmpmeta") ||
    containsAscii(bytes, "GPSLatitude") ||
    containsAscii(bytes, "GPSLongitude")
  ) {
    throw new Error("Image metadata was detected. Upload a processed derivative, not the raw photo.");
  }

  return { width, height };
}

function parseWebp(bytes: Uint8Array) {
  if (
    bytes.length < 30 ||
    ascii(bytes, 0, 4) !== "RIFF" ||
    ascii(bytes, 8, 4) !== "WEBP"
  ) {
    throw new Error("The image is not a valid WebP file.");
  }
  if (readUint32LittleEndian(bytes, 4) + 8 !== bytes.length) {
    throw new Error("The WebP file has an invalid length.");
  }

  let offset = 12;
  let width = 0;
  let height = 0;
  let hasPrivateMetadata = false;

  while (offset + 8 <= bytes.length) {
    const chunkType = ascii(bytes, offset, 4);
    const chunkLength = readUint32LittleEndian(bytes, offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkLength;
    if (dataEnd > bytes.length) throw new Error("The WebP file is truncated.");

    if (chunkType === "EXIF" || chunkType === "XMP " || chunkType === "ICCP") {
      hasPrivateMetadata = true;
    } else if (chunkType === "VP8X") {
      if (chunkLength < 10) throw new Error("The WebP dimensions are invalid.");
      width = readUint24LittleEndian(bytes, dataStart + 4) + 1;
      height = readUint24LittleEndian(bytes, dataStart + 7) + 1;
    } else if (chunkType === "VP8 ") {
      if (
        chunkLength >= 10 &&
        bytes[dataStart + 3] === 0x9d &&
        bytes[dataStart + 4] === 0x01 &&
        bytes[dataStart + 5] === 0x2a
      ) {
        width = readUint16(bytes, dataStart + 6) & 0x3fff;
        height = readUint16(bytes, dataStart + 8) & 0x3fff;
      }
    } else if (chunkType === "VP8L") {
      if (chunkLength >= 5 && bytes[dataStart] === 0x2f) {
        const bits = readUint32LittleEndian(bytes, dataStart + 1);
        width = (bits & 0x3fff) + 1;
        height = ((bits >> 14) & 0x3fff) + 1;
      }
    }

    offset = dataEnd + (chunkLength % 2);
  }

  if (!width || !height) throw new Error("The WebP file has no readable dimensions.");
  if (hasPrivateMetadata) {
    throw new Error("Image metadata was detected. Upload a processed derivative, not the raw photo.");
  }

  return { width, height };
}

function validateDimensions(width: number, height: number) {
  if (
    width < 1 ||
    height < 1 ||
    width > MEDIA_MAX_DIMENSION ||
    height > MEDIA_MAX_DIMENSION ||
    width * height > MEDIA_MAX_PIXELS
  ) {
    throw new Error(`Processed images must be no larger than ${MEDIA_MAX_DIMENSION}px per side.`);
  }
}

export async function validateGuideImage(file: File): Promise<ValidatedGuideImage> {
  if (file.size < 16 || file.size > MEDIA_MAX_BYTES) {
    throw new Error("Processed images must be between 16 bytes and 8 MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (file.type === "image/jpeg") {
    const dimensions = parseJpeg(bytes);
    validateDimensions(dimensions.width, dimensions.height);
    return { bytes, mediaType: "image/jpeg", extension: "jpg", ...dimensions };
  }

  if (file.type === "image/webp") {
    const dimensions = parseWebp(bytes);
    validateDimensions(dimensions.width, dimensions.height);
    return { bytes, mediaType: "image/webp", extension: "webp", ...dimensions };
  }

  throw new Error("Processed images must be JPEG or WebP files.");
}

export async function validatePdfManual(file: File): Promise<ValidatedManual> {
  if (file.type !== "application/pdf") throw new Error("Manuals must be PDF files.");
  if (file.size < 8 || file.size > MANUAL_MAX_BYTES) {
    throw new Error("PDF manuals must be between 8 bytes and 20 MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasPrefix(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    throw new Error("The uploaded file does not have a valid PDF signature.");
  }

  const tailStart = Math.max(0, bytes.length - 2_048);
  if (!containsAscii(bytes.subarray(tailStart), "%%EOF")) {
    throw new Error("The PDF appears to be incomplete.");
  }

  return { bytes, mediaType: "application/pdf", extension: "pdf" };
}

async function getR2Bucket(): Promise<R2Bucket | undefined> {
  try {
    const context = await getCloudflareContext({ async: true });
    return (context.env as ObjectStorageEnv).HOMES_MEDIA;
  } catch {
    return undefined;
  }
}

async function localObjectRoot() {
  if (process.env.FAMOUS_LAND_HOMES_OBJECTS_PATH) {
    return process.env.FAMOUS_LAND_HOMES_OBJECTS_PATH;
  }

  if (process.env.VERCEL) return "/tmp/famous-land-homes-objects";
  const path = await import("node:path");
  return path.join(process.cwd(), ".data", "homes-objects");
}

function assertGeneratedKey(key: string) {
  if (!/^homes\/[a-z0-9_-]+\/(media|manuals)\/[0-9a-f-]+\.(jpg|webp|pdf)$/.test(key)) {
    throw new Error("Invalid homes object key.");
  }
}

function generatedKeyPrefix(homeId: string, kind: "media" | "manuals") {
  return `homes/${safePathPart(homeId)}/${kind}/`;
}

/**
 * The database record and object path must agree before any private file is read.
 * Object keys are generated server-side, but this also protects against a bad or
 * hand-edited database record crossing from one home to another.
 */
export function assertHomesObjectOwnership(
  key: string,
  homeId: string,
  kind: "media" | "manuals"
) {
  assertGeneratedKey(key);
  if (!key.startsWith(generatedKeyPrefix(homeId, kind))) {
    throw new Error("The stored object does not belong to this home.");
  }
  const hasExpectedExtension =
    kind === "media" ? /\.(jpg|webp)$/.test(key) : /\.pdf$/.test(key);
  if (!hasExpectedExtension) {
    throw new Error("The stored object type does not match its record.");
  }
}

export async function storeHomesObject(input: {
  homeId: string;
  kind: "media" | "manuals";
  extension: "jpg" | "webp" | "pdf";
  bytes: Uint8Array;
  contentType: string;
  originalFileName: string;
}): Promise<StoredHomesObject> {
  const homePart = safePathPart(input.homeId);
  const key = `homes/${homePart}/${input.kind}/${crypto.randomUUID()}.${input.extension}`;
  assertGeneratedKey(key);

  const bucket = await getR2Bucket();
  if (bucket) {
    await bucket.put(key, input.bytes, {
      httpMetadata: {
        contentType: input.contentType,
        contentDisposition: input.kind === "manuals" ? "attachment" : "inline"
      },
      customMetadata: {
        homeId: input.homeId.slice(0, 100),
        source: "homes-admin-processed-upload",
        originalFileName: input.originalFileName.slice(0, 200)
      }
    });
    return { key, byteSize: input.bytes.byteLength };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("HOMES_MEDIA object storage is not configured.");
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const root = await localObjectRoot();
  const destination = path.join(root, ...key.split("/"));
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, input.bytes);
  return { key, byteSize: input.bytes.byteLength };
}

export async function deleteHomesObject(key: string): Promise<void> {
  assertGeneratedKey(key);
  const bucket = await getR2Bucket();
  if (bucket) {
    await bucket.delete(key);
    return;
  }

  if (process.env.NODE_ENV === "production") return;
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const root = await localObjectRoot();
  await fs.rm(path.join(root, ...key.split("/")), { force: true });
}

export async function readHomesObject(input: {
  key: string;
  homeId: string;
  kind: "media" | "manuals";
}): Promise<HomesObjectBody | undefined> {
  assertHomesObjectOwnership(input.key, input.homeId, input.kind);

  const bucket = await getR2Bucket();
  if (bucket) {
    const object = await bucket.get(input.key);
    if (!object) return undefined;
    const body = await object.arrayBuffer();
    return { body, byteSize: object.size ?? body.byteLength };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("HOMES_MEDIA object storage is not configured.");
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const root = await localObjectRoot();

  try {
    const bytes = await fs.readFile(path.join(root, ...input.key.split("/")));
    const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    return { body, byteSize: bytes.byteLength };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}
