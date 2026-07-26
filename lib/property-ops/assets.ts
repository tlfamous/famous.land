import { getHome } from "./repository";
import {
  getHomesD1,
  mutateLocalHomesStore,
  readLocalHomesStore,
  runD1Batch,
  type HomesD1
} from "./storage";
import {
  MEDIA_VISIBILITIES,
  type HomeAuditEvent,
  type HomeMedia,
  type HomeMediaInput,
  type MutationContext
} from "./types";

type MediaRow = {
  id: string;
  home_id: string;
  title: string;
  alt_text: string | null;
  r2_object_key: string;
  file_name: string;
  media_type: string;
  byte_size: number | null;
  width: number | null;
  height: number | null;
  visibility: HomeMedia["visibility"];
  metadata_stripped: number | boolean;
  processed_at: string;
  created_at: string;
  updated_at: string;
};

const text = (value: string | null | undefined, max: number) => {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, max) : undefined;
};

const required = (value: string, field: string, max: number) => {
  const normalized = text(value, max);
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
};

function positiveInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  const normalized = Number(value);
  if (!Number.isSafeInteger(normalized) || normalized < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }
  return normalized;
}

function mediaFromRow(row: MediaRow): HomeMedia {
  if (!Boolean(row.metadata_stripped)) throw new Error("Unsafe unprocessed media record.");
  return {
    id: row.id,
    homeId: row.home_id,
    title: row.title,
    altText: row.alt_text ?? undefined,
    r2ObjectKey: row.r2_object_key,
    fileName: row.file_name,
    mediaType: row.media_type,
    byteSize: row.byte_size === null ? undefined : Number(row.byte_size),
    width: row.width === null ? undefined : Number(row.width),
    height: row.height === null ? undefined : Number(row.height),
    visibility: row.visibility,
    metadataStripped: true,
    processedAt: row.processed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function auditEvent(
  homeId: string,
  action: string,
  entityType: string,
  entityId: string,
  context: MutationContext
): HomeAuditEvent {
  return {
    id: crypto.randomUUID(),
    homeId,
    action,
    entityType,
    entityId,
    adminSessionId: context.adminSessionId,
    createdAt: new Date().toISOString()
  };
}

function auditStatement(d1: HomesD1, event: HomeAuditEvent) {
  return d1
    .prepare(
      `insert into homes_audit_events (
         id, home_id, action, entity_type, entity_id, admin_session_id, detail_json, created_at
       ) values (?, ?, ?, ?, ?, ?, null, ?)`
    )
    .bind(
      event.id,
      event.homeId,
      event.action,
      event.entityType,
      event.entityId,
      event.adminSessionId ?? null,
      event.createdAt
    );
}

async function requireHome(homeId: string): Promise<void> {
  if (!(await getHome(homeId))) throw new Error("Home not found.");
}

export async function listHomeMedia(homeId: string): Promise<HomeMedia[]> {
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare("select * from home_media where home_id = ? order by created_at desc")
      .bind(homeId)
      .all<MediaRow>();
    if (!result.success) throw new Error(result.error ?? "Media query failed.");
    return (result.results ?? []).map(mediaFromRow);
  }
  const store = await readLocalHomesStore();
  return store.media
    .filter((media) => media.homeId === homeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((media) => structuredClone(media));
}

export async function getHomeMedia(mediaId: string): Promise<HomeMedia | undefined> {
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare("select * from home_media where id = ?")
      .bind(mediaId)
      .first<MediaRow>();
    return row ? mediaFromRow(row) : undefined;
  }
  const store = await readLocalHomesStore();
  const media = store.media.find((item) => item.id === mediaId);
  return media ? structuredClone(media) : undefined;
}

function normalizeMedia(homeId: string, input: HomeMediaInput, existing?: HomeMedia): HomeMedia {
  if (input.metadataStripped !== true) {
    throw new Error("Media must be re-encoded with metadata stripped before registration.");
  }
  if (!MEDIA_VISIBILITIES.includes(input.visibility)) throw new Error("Invalid media visibility.");
  const processedAt = required(input.processedAt, "Processed timestamp", 100);
  if (!Number.isFinite(Date.parse(processedAt))) throw new Error("Invalid processed timestamp.");
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? input.id ?? crypto.randomUUID(),
    homeId,
    title: required(input.title, "Media title", 200),
    altText: text(input.altText, 500),
    r2ObjectKey: required(input.r2ObjectKey, "Media object key", 1_000),
    fileName: required(input.fileName, "Media file name", 500),
    mediaType: required(input.mediaType, "Media type", 200),
    byteSize: positiveInteger(input.byteSize, "Media byte size"),
    width: positiveInteger(input.width, "Media width"),
    height: positiveInteger(input.height, "Media height"),
    visibility: input.visibility,
    metadataStripped: true,
    processedAt: new Date(processedAt).toISOString(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

export async function upsertHomeMedia(
  homeId: string,
  input: HomeMediaInput,
  context: MutationContext = {}
): Promise<HomeMedia> {
  await requireHome(homeId);
  const existing = input.id ? await getHomeMedia(input.id) : undefined;
  if (existing && existing.homeId !== homeId) throw new Error("Media belongs to another home.");
  const media = normalizeMedia(homeId, input, existing);
  const d1 = await getHomesD1();
  if (d1) {
    const event = auditEvent(homeId, "media.upsert", "media", media.id, context);
    await runD1Batch(d1, [
      d1
        .prepare(
          `insert into home_media (
             id, home_id, inventory_item_id, title, alt_text, r2_object_key, file_name,
             media_type, byte_size, width, height, visibility, metadata_stripped,
             processed_at, created_at, updated_at
           ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
           on conflict(id) do update set title = excluded.title, alt_text = excluded.alt_text,
             r2_object_key = excluded.r2_object_key, file_name = excluded.file_name,
             media_type = excluded.media_type, byte_size = excluded.byte_size,
             width = excluded.width, height = excluded.height, visibility = excluded.visibility,
             metadata_stripped = 1, processed_at = excluded.processed_at,
             updated_at = excluded.updated_at`
        )
        .bind(
          media.id,
          homeId,
          null,
          media.title,
          media.altText ?? null,
          media.r2ObjectKey,
          media.fileName,
          media.mediaType,
          media.byteSize ?? null,
          media.width ?? null,
          media.height ?? null,
          media.visibility,
          media.processedAt,
          media.createdAt,
          media.updatedAt
        ),
      auditStatement(d1, event)
    ]);
    return (await getHomeMedia(media.id))!;
  }
  return mutateLocalHomesStore((store) => {
    const index = store.media.findIndex((item) => item.id === media.id);
    if (index >= 0 && store.media[index].homeId !== homeId) {
      throw new Error("Media belongs to another home.");
    }
    if (
      store.media.some(
        (item) => item.id !== media.id && item.r2ObjectKey === media.r2ObjectKey
      )
    ) {
      throw new Error("That media object is already registered.");
    }
    if (index >= 0) store.media[index] = media;
    else store.media.push(media);
    store.auditEvents.push(auditEvent(homeId, "media.upsert", "media", media.id, context));
    return structuredClone(media);
  });
}

export async function createHomeMedia(
  homeId: string,
  input: HomeMediaInput,
  context: MutationContext = {}
): Promise<HomeMedia> {
  return upsertHomeMedia(homeId, { ...input, id: undefined }, context);
}

export async function updateHomeMedia(
  mediaId: string,
  input: Omit<HomeMediaInput, "id">,
  context: MutationContext = {}
): Promise<HomeMedia> {
  const existing = await getHomeMedia(mediaId);
  if (!existing) throw new Error("Media not found.");
  return upsertHomeMedia(existing.homeId, { ...input, id: mediaId }, context);
}

export async function deleteHomeMedia(
  homeId: string,
  mediaId: string,
  context: MutationContext = {}
): Promise<void> {
  const media = await getHomeMedia(mediaId);
  if (!media || media.homeId !== homeId) throw new Error("Media not found for this home.");
  const d1 = await getHomesD1();
  if (d1) {
    await runD1Batch(d1, [
      d1.prepare("delete from home_media where id = ? and home_id = ?").bind(mediaId, homeId),
      auditStatement(d1, auditEvent(homeId, "media.delete", "media", mediaId, context))
    ]);
    return;
  }
  await mutateLocalHomesStore((store) => {
    store.media = store.media.filter((item) => item.id !== mediaId);
    store.auditEvents.push(auditEvent(homeId, "media.delete", "media", mediaId, context));
  });
}
