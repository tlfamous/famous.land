import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  assertD1Success,
  getHomesD1,
  mutateLocalHomesStore,
  readLocalHomesStore,
  type HomesD1
} from "./storage";
import type { HomeLockDevice, HomeLockEvent, LockState } from "./types";
import { recordHomeActivity } from "./activity";

const SEAM_API_BASE = "https://connect.getseam.com";
const KNOWN_DEVICE_HOMES: Record<string, { homeId: string; id: string }> = {
  "4f80fb1f-a8fa-47ea-932d-f9b7dacc7610": { homeId: "home_lh2", id: "lock_lh2_schlage" },
  "e010f900-122c-493d-a1c9-2bada43bf48a": { homeId: "home_lh3", id: "lock_lh3_yale" }
};

type SeamRuntimeEnv = {
  SEAM_API_KEY?: string;
  SEAM_WEBHOOK_SECRET?: string;
};

type SeamObject = Record<string, unknown>;

type LockDeviceRow = {
  id: string;
  home_id: string;
  seam_device_id: string;
  connected_account_id: string | null;
  provider: string;
  display_name: string;
  model: string | null;
  lock_state: LockState;
  online: number | boolean;
  battery_level: number | null;
  has_native_entry_events: number | boolean;
  access_code_count: number;
  last_event_at: string | null;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
};

type LockEventRow = {
  id: string;
  home_id: string;
  lock_device_id: string;
  seam_device_id: string;
  event_type: string;
  occurred_at: string;
  received_at: string;
  access_code_id: string | null;
  access_code_name: string | null;
  method: string | null;
  description: string | null;
  metadata_json: string | null;
};

async function getSeamRuntimeEnv(): Promise<SeamRuntimeEnv> {
  try {
    const context = await getCloudflareContext({ async: true });
    return context.env as SeamRuntimeEnv;
  } catch {
    return {
      SEAM_API_KEY: process.env.SEAM_API_KEY,
      SEAM_WEBHOOK_SECRET: process.env.SEAM_WEBHOOK_SECRET
    };
  }
}

function normalizeSecret(value: string | undefined): string | undefined {
  // Secret upload tools can preserve a terminal newline. Seam keys and Svix
  // secrets are printable ASCII, so discard transport-only control bytes.
  return value?.replace(/[^\x21-\x7e]/g, "").trim() || undefined;
}

export async function getSeamWebhookSecret(): Promise<string | undefined> {
  return normalizeSecret((await getSeamRuntimeEnv()).SEAM_WEBHOOK_SECRET);
}

async function seamRequest<T extends SeamObject>(path: string, body: SeamObject = {}): Promise<T> {
  const apiKey = normalizeSecret((await getSeamRuntimeEnv()).SEAM_API_KEY);
  if (!apiKey) throw new Error("Seam is not configured for Famous Land.");
  const response = await fetch(`${SEAM_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });
  const result = (await response.json().catch(() => ({}))) as T & {
    error?: { message?: string };
    message?: string;
  };
  if (!response.ok) {
    throw new Error(result.error?.message || result.message || `Seam request failed (${response.status}).`);
  }
  return result;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function record(value: unknown): SeamObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as SeamObject)
    : {};
}

function boolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function number(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeBatteryLevel(value: unknown): number | undefined {
  const level = number(value);
  if (level === undefined) return undefined;
  // Seam reports battery_level as a 0–1 fraction. Keep compatibility with
  // previously seeded or imported percentage values as well.
  return Math.max(0, Math.min(100, level <= 1 ? level * 100 : level));
}

function deviceFromRow(row: LockDeviceRow): HomeLockDevice {
  return {
    id: row.id,
    homeId: row.home_id,
    seamDeviceId: row.seam_device_id,
    connectedAccountId: row.connected_account_id ?? undefined,
    provider: row.provider,
    displayName: row.display_name,
    model: row.model ?? undefined,
    lockState: row.lock_state,
    online: Boolean(row.online),
    batteryLevel: row.battery_level ?? undefined,
    hasNativeEntryEvents: Boolean(row.has_native_entry_events),
    accessCodeCount: Number(row.access_code_count),
    lastEventAt: row.last_event_at ?? undefined,
    lastSyncedAt: row.last_synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function eventFromRow(row: LockEventRow): HomeLockEvent {
  return {
    id: row.id,
    homeId: row.home_id,
    lockDeviceId: row.lock_device_id,
    seamDeviceId: row.seam_device_id,
    eventType: row.event_type,
    occurredAt: row.occurred_at,
    receivedAt: row.received_at,
    accessCodeId: row.access_code_id ?? undefined,
    accessCodeName: row.access_code_name ?? undefined,
    method: row.method ?? undefined,
    description: row.description ?? undefined,
    metadata: row.metadata_json
      ? (JSON.parse(row.metadata_json) as HomeLockEvent["metadata"])
      : undefined
  };
}

export async function listHomeLockDevices(homeId: string): Promise<HomeLockDevice[]> {
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare("select * from home_lock_devices where home_id = ? order by display_name asc")
      .bind(homeId)
      .all<LockDeviceRow>();
    if (!result.success) throw new Error(result.error ?? "Lock device query failed.");
    return (result.results ?? []).map(deviceFromRow);
  }
  const store = await readLocalHomesStore();
  return (store.lockDevices ?? [])
    .filter((device) => device.homeId === homeId)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((device) => structuredClone(device));
}

export async function listAllHomeLockDevices(): Promise<HomeLockDevice[]> {
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare("select * from home_lock_devices order by home_id asc, display_name asc")
      .all<LockDeviceRow>();
    if (!result.success) throw new Error(result.error ?? "Lock device query failed.");
    return (result.results ?? []).map(deviceFromRow);
  }
  const store = await readLocalHomesStore();
  return (store.lockDevices ?? []).map((device) => structuredClone(device));
}

export async function listHomeLockEvents(homeId: string, limit = 50): Promise<HomeLockEvent[]> {
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare("select * from home_lock_events where home_id = ? order by occurred_at desc limit ?")
      .bind(homeId, safeLimit)
      .all<LockEventRow>();
    if (!result.success) throw new Error(result.error ?? "Lock event query failed.");
    return (result.results ?? []).map(eventFromRow);
  }
  const store = await readLocalHomesStore();
  return (store.lockEvents ?? [])
    .filter((event) => event.homeId === homeId)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, safeLimit)
    .map((event) => structuredClone(event));
}

function normalizeLockState(properties: SeamObject): LockState {
  const locked = boolean(properties.locked);
  return locked === true ? "locked" : locked === false ? "unlocked" : "unknown";
}

function normalizeSeamDevice(source: SeamObject, existing?: HomeLockDevice): HomeLockDevice | undefined {
  const seamDeviceId = text(source.device_id);
  if (!seamDeviceId) return undefined;
  const mapping = KNOWN_DEVICE_HOMES[seamDeviceId];
  if (!mapping && !existing) return undefined;
  const properties = record(source.properties);
  const schlage = record(source.schlage_metadata);
  const yale = record(source.yale_metadata);
  const now = new Date().toISOString();
  const lockState = normalizeLockState(properties);
  return {
    id: existing?.id ?? mapping.id,
    homeId: existing?.homeId ?? mapping.homeId,
    seamDeviceId,
    connectedAccountId: text(source.connected_account_id) ?? existing?.connectedAccountId,
    provider:
      text(source.manufacturer) ??
      text(source.brand) ??
      existing?.provider ??
      "Smart lock",
    displayName: text(source.display_name) ?? existing?.displayName ?? "Door lock",
    model:
      text(schlage.model) ??
      text(yale.model) ??
      text(source.device_type) ??
      existing?.model,
    lockState: lockState === "unknown" ? existing?.lockState ?? "unknown" : lockState,
    online: boolean(properties.online) ?? existing?.online ?? false,
    batteryLevel: normalizeBatteryLevel(properties.battery_level) ?? existing?.batteryLevel,
    hasNativeEntryEvents:
      boolean(properties.has_native_entry_events) ?? existing?.hasNativeEntryEvents ?? false,
    accessCodeCount: existing?.accessCodeCount ?? 0,
    lastEventAt: existing?.lastEventAt,
    lastSyncedAt: now,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

async function saveLockDevice(device: HomeLockDevice, d1?: HomesD1): Promise<void> {
  if (d1) {
    const result = await d1
      .prepare(
        `insert into home_lock_devices (
           id, home_id, seam_device_id, connected_account_id, provider, display_name,
           model, lock_state, online, battery_level, has_native_entry_events,
           access_code_count, last_event_at, last_synced_at, created_at, updated_at
         ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         on conflict(seam_device_id) do update set
           home_id = excluded.home_id,
           connected_account_id = excluded.connected_account_id,
           provider = excluded.provider,
           display_name = excluded.display_name,
           model = excluded.model,
           lock_state = excluded.lock_state,
           online = excluded.online,
           battery_level = excluded.battery_level,
           has_native_entry_events = excluded.has_native_entry_events,
           access_code_count = excluded.access_code_count,
           last_event_at = coalesce(excluded.last_event_at, home_lock_devices.last_event_at),
           last_synced_at = excluded.last_synced_at,
           updated_at = excluded.updated_at`
      )
      .bind(
        device.id,
        device.homeId,
        device.seamDeviceId,
        device.connectedAccountId ?? null,
        device.provider,
        device.displayName,
        device.model ?? null,
        device.lockState,
        device.online ? 1 : 0,
        device.batteryLevel ?? null,
        device.hasNativeEntryEvents ? 1 : 0,
        device.accessCodeCount,
        device.lastEventAt ?? null,
        device.lastSyncedAt,
        device.createdAt,
        device.updatedAt
      )
      .run();
    assertD1Success(result, "Lock device update failed.");
    return;
  }
  await mutateLocalHomesStore((store) => {
    store.lockDevices ??= [];
    const index = store.lockDevices.findIndex((item) => item.seamDeviceId === device.seamDeviceId);
    if (index >= 0) store.lockDevices[index] = structuredClone(device);
    else store.lockDevices.push(structuredClone(device));
  });
}

function sanitizeDescription(value: unknown): string | undefined {
  const description = text(value);
  if (!description) return undefined;
  return description
    .replace(/\b\d{4,10}\b/g, "[redacted]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted]")
    .slice(0, 500);
}

function safeMetadata(source: SeamObject): HomeLockEvent["metadata"] | undefined {
  const properties = record(source.properties);
  const candidates: HomeLockEvent["metadata"] = {
    batteryLevel:
      normalizeBatteryLevel(source.battery_level) ??
      normalizeBatteryLevel(properties.battery_level) ??
      null,
    online: boolean(source.online) ?? boolean(properties.online) ?? null,
    locked: boolean(source.locked) ?? boolean(properties.locked) ?? null,
    triggeredBy: text(source.triggered_by) ?? null
  };
  if (Object.values(candidates).every((value) => value === null)) return undefined;
  return candidates;
}

function normalizeSeamEvent(source: SeamObject, device: HomeLockDevice): HomeLockEvent | undefined {
  const id = text(source.event_id);
  const eventType = text(source.event_type);
  if (!id || !eventType) return undefined;
  const accessCode = record(source.access_code);
  const occurredAt = text(source.occurred_at) ?? text(source.created_at) ?? new Date().toISOString();
  return {
    id,
    homeId: device.homeId,
    lockDeviceId: device.id,
    seamDeviceId: device.seamDeviceId,
    eventType,
    occurredAt,
    receivedAt: new Date().toISOString(),
    accessCodeId: text(source.access_code_id),
    accessCodeName: text(source.access_code_name) ?? text(accessCode.name),
    method: text(source.method) ?? text(source.lock_method),
    description: sanitizeDescription(source.event_description),
    metadata: safeMetadata(source)
  };
}

function applyEventToDevice(device: HomeLockDevice, event: HomeLockEvent): HomeLockDevice {
  const metadata = event.metadata ?? {};
  const next = { ...device, lastEventAt: event.occurredAt, updatedAt: new Date().toISOString() };
  if (event.eventType === "lock.locked") next.lockState = "locked";
  if (event.eventType === "lock.unlocked") next.lockState = "unlocked";
  if (event.eventType === "device.connected") next.online = true;
  if (event.eventType === "device.disconnected") next.online = false;
  if (typeof metadata.batteryLevel === "number") next.batteryLevel = metadata.batteryLevel;
  return next;
}

async function saveLockEvent(event: HomeLockEvent, d1?: HomesD1): Promise<void> {
  if (d1) {
    const result = await d1
      .prepare(
        `insert or ignore into home_lock_events (
           id, home_id, lock_device_id, seam_device_id, event_type, occurred_at,
           received_at, access_code_id, access_code_name, method, description, metadata_json
         ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        event.id,
        event.homeId,
        event.lockDeviceId,
        event.seamDeviceId,
        event.eventType,
        event.occurredAt,
        event.receivedAt,
        event.accessCodeId ?? null,
        event.accessCodeName ?? null,
        event.method ?? null,
        event.description ?? null,
        event.metadata ? JSON.stringify(event.metadata) : null
      )
      .run();
    assertD1Success(result, "Lock event update failed.");
    return;
  }
  await mutateLocalHomesStore((store) => {
    store.lockEvents ??= [];
    if (!store.lockEvents.some((item) => item.id === event.id)) {
      store.lockEvents.push(structuredClone(event));
    }
  });
}

export async function ingestSeamEvent(payload: SeamObject): Promise<boolean> {
  const source = record(payload.event ?? payload);
  const seamDeviceId = text(source.device_id);
  if (!seamDeviceId) return false;
  const devices = await listAllHomeLockDevices();
  const device = devices.find((item) => item.seamDeviceId === seamDeviceId);
  if (!device) return false;
  const event = normalizeSeamEvent(source, device);
  if (!event) return false;
  const d1 = await getHomesD1();
  await saveLockEvent(event, d1);
  await saveLockDevice(applyEventToDevice(device, event), d1);
  await recordHomeActivity({
    homeId: event.homeId,
    source: "seam",
    sourceEventId: event.id,
    eventType: event.eventType,
    occurredAt: event.occurredAt,
    receivedAt: event.receivedAt,
    deviceId: event.seamDeviceId,
    deviceName: device.displayName,
    description: event.description,
    metadata: event.metadata
  });
  return true;
}

export async function syncSeamLocks(): Promise<{ devices: number; events: number }> {
  const existing = await listAllHomeLockDevices();
  const response = await seamRequest<{ devices?: SeamObject[] }>("/devices/list");
  const devices = Array.isArray(response.devices) ? response.devices : [];
  const d1 = await getHomesD1();
  let savedDevices = 0;
  for (const source of devices) {
    const seamDeviceId = text(source.device_id);
    const normalized = normalizeSeamDevice(
      source,
      existing.find((item) => item.seamDeviceId === seamDeviceId)
    );
    if (!normalized) continue;
    await saveLockDevice(normalized, d1);
    savedDevices += 1;
  }

  const mappedDevices = await listAllHomeLockDevices();
  if (!mappedDevices.length) return { devices: savedDevices, events: 0 };
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const eventResponse = await seamRequest<{ events?: SeamObject[] }>("/events/list", {
    device_ids: mappedDevices.map((item) => item.seamDeviceId),
    since,
    limit: 500
  });
  const events = Array.isArray(eventResponse.events) ? eventResponse.events : [];
  let savedEvents = 0;
  for (const source of events) {
    if (await ingestSeamEvent(source)) savedEvents += 1;
  }
  return { devices: savedDevices, events: savedEvents };
}
