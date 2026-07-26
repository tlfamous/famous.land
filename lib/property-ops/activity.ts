import { decryptHomeSecretJson, encryptHomeSecretJson } from "./crypto";
import { listHomeLockEvents } from "./locks";
import { assertD1Success, getHomesD1, mutateLocalHomesStore, readLocalHomesStore, type HomesD1 } from "./storage";
import type { EncryptedHomeSecret, HomeActivityEvent, HomeActivitySource, HomeNetworkIntegration } from "./types";

type ActivityRow = {
  id: string; home_id: string; source: HomeActivitySource; source_event_id: string; event_type: string;
  occurred_at: string; received_at: string; device_id: string | null; device_name: string | null;
  description: string | null; metadata_json: string | null;
};
type NetworkRow = {
  id: string; home_id: string; provider: "eero"; status: HomeNetworkIntegration["status"];
  account_hint: string | null; network_id: string | null; network_name: string | null; baseline_established: number | boolean;
  last_synced_at: string | null; last_error: string | null; created_at: string; updated_at: string;
};

export type ActivityInput = Omit<HomeActivityEvent, "id" | "receivedAt"> & { id?: string; receivedAt?: string; sensitive?: Record<string, unknown> };

function fromRow(row: ActivityRow): HomeActivityEvent {
  return { id: row.id, homeId: row.home_id, source: row.source, sourceEventId: row.source_event_id, eventType: row.event_type, occurredAt: row.occurred_at, receivedAt: row.received_at, ...(row.device_id ? { deviceId: row.device_id } : {}), ...(row.device_name ? { deviceName: row.device_name } : {}), ...(row.description ? { description: row.description } : {}), ...(row.metadata_json ? { metadata: JSON.parse(row.metadata_json) as HomeActivityEvent["metadata"] } : {}) };
}
function integrationFromRow(row: NetworkRow): HomeNetworkIntegration {
  return { id: row.id, homeId: row.home_id, provider: row.provider, status: row.status, ...(row.account_hint ? { accountHint: row.account_hint } : {}), ...(row.network_id ? { networkId: row.network_id } : {}), ...(row.network_name ? { networkName: row.network_name } : {}), baselineEstablished: Boolean(row.baseline_established), ...(row.last_synced_at ? { lastSyncedAt: row.last_synced_at } : {}), ...(row.last_error ? { lastError: row.last_error } : {}), createdAt: row.created_at, updatedAt: row.updated_at };
}
function seamActivity(event: Awaited<ReturnType<typeof listHomeLockEvents>>[number]): HomeActivityEvent {
  return { id: `seam:${event.id}`, homeId: event.homeId, source: "seam", sourceEventId: event.id, eventType: event.eventType, occurredAt: event.occurredAt, receivedAt: event.receivedAt, deviceId: event.seamDeviceId, description: event.description, metadata: event.metadata };
}

export async function listHomeActivityEvents(homeId: string, limit = 200): Promise<HomeActivityEvent[]> {
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1.prepare("select * from home_activity_events where home_id = ? order by occurred_at desc limit ?").bind(homeId, safeLimit).all<ActivityRow>();
    if (!result.success) throw new Error(result.error || "Activity query failed.");
    return (result.results || []).map(fromRow);
  }
  const store = await readLocalHomesStore();
  const current = (store.activityEvents || []).filter((event) => event.homeId === homeId);
  const combined = new Map(current.map((event) => [`${event.source}:${event.sourceEventId}`, event]));
  for (const lockEvent of await listHomeLockEvents(homeId, safeLimit)) combined.set(`seam:${lockEvent.id}`, seamActivity(lockEvent));
  return [...combined.values()].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, safeLimit);
}

export async function recordHomeActivity(input: ActivityInput): Promise<boolean> {
  const id = input.id || `${input.source}:${input.sourceEventId}`;
  const receivedAt = input.receivedAt || new Date().toISOString();
  const d1 = await getHomesD1();
  const secret = input.sensitive && Object.keys(input.sensitive).length ? await encryptHomeSecretJson(input.sensitive, `activity:${id}`) : undefined;
  if (d1) {
    const result = await d1.prepare(`insert or ignore into home_activity_events (id, home_id, source, source_event_id, event_type, occurred_at, received_at, device_id, device_name, description, metadata_json, sensitive_ciphertext, sensitive_iv, sensitive_algorithm, sensitive_key_version) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, input.homeId, input.source, input.sourceEventId, input.eventType, input.occurredAt, receivedAt, input.deviceId ?? null, input.deviceName ?? null, input.description ?? null, input.metadata ? JSON.stringify(input.metadata) : null, secret?.ciphertext ?? null, secret?.iv ?? null, secret?.algorithm ?? null, secret?.keyVersion ?? null).run();
    assertD1Success(result, "Activity event could not be stored.");
    return Boolean(result.meta?.changes);
  }
  return mutateLocalHomesStore((store) => {
    store.activityEvents ??= [];
    if (store.activityEvents.some((event) => event.source === input.source && event.sourceEventId === input.sourceEventId)) return false;
    store.activityEvents.push({ id, homeId: input.homeId, source: input.source, sourceEventId: input.sourceEventId, eventType: input.eventType, occurredAt: input.occurredAt, receivedAt, ...(input.deviceId ? { deviceId: input.deviceId } : {}), ...(input.deviceName ? { deviceName: input.deviceName } : {}), ...(input.description ? { description: input.description } : {}), ...(input.metadata ? { metadata: input.metadata } : {}) });
    return true;
  });
}

export async function getHomeNetworkIntegration(homeId: string): Promise<HomeNetworkIntegration | undefined> {
  const d1 = await getHomesD1();
  if (d1) { const row = await d1.prepare("select * from home_network_integrations where home_id = ?").bind(homeId).first<NetworkRow>(); return row ? integrationFromRow(row) : undefined; }
  const store = await readLocalHomesStore(); return structuredClone((store.networkIntegrations || []).find((item) => item.homeId === homeId));
}

export async function saveHomeNetworkIntegration(input: Omit<HomeNetworkIntegration, "createdAt" | "updatedAt" | "id"> & { id?: string; session?: Record<string, unknown> }) {
  const existing = await getHomeNetworkIntegration(input.homeId); const now = new Date().toISOString(); const integration: HomeNetworkIntegration = { id: existing?.id || input.id || crypto.randomUUID(), ...input, createdAt: existing?.createdAt || now, updatedAt: now };
  const secret = input.session ? await encryptHomeSecretJson(input.session, `eero:${integration.id}`) : undefined;
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1.prepare(`insert into home_network_integrations (id, home_id, provider, status, account_hint, network_id, network_name, session_ciphertext, session_iv, session_algorithm, session_key_version, baseline_established, last_synced_at, last_error, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) on conflict(home_id) do update set provider=excluded.provider,status=excluded.status,account_hint=excluded.account_hint,network_id=excluded.network_id,network_name=excluded.network_name,session_ciphertext=coalesce(excluded.session_ciphertext,home_network_integrations.session_ciphertext),session_iv=coalesce(excluded.session_iv,home_network_integrations.session_iv),session_algorithm=coalesce(excluded.session_algorithm,home_network_integrations.session_algorithm),session_key_version=coalesce(excluded.session_key_version,home_network_integrations.session_key_version),baseline_established=excluded.baseline_established,last_synced_at=excluded.last_synced_at,last_error=excluded.last_error,updated_at=excluded.updated_at`).bind(integration.id,integration.homeId,"eero",integration.status,integration.accountHint ?? null,integration.networkId ?? null,integration.networkName ?? null,secret?.ciphertext ?? null,secret?.iv ?? null,secret?.algorithm ?? null,secret?.keyVersion ?? null,integration.baselineEstablished ? 1 : 0,integration.lastSyncedAt ?? null,integration.lastError ?? null,integration.createdAt,integration.updatedAt).run(); assertD1Success(result,"Network integration could not be saved."); return integration;
  }
  return mutateLocalHomesStore((store) => { store.networkIntegrations ??= []; const index = store.networkIntegrations.findIndex((item) => item.homeId === integration.homeId); if(index>=0) store.networkIntegrations[index]=integration; else store.networkIntegrations.push(integration); return integration; });
}

export async function getEeroSession(homeId: string): Promise<Record<string, unknown> | undefined> {
  const integration = await getHomeNetworkIntegration(homeId); if (!integration) return undefined; const d1 = await getHomesD1();
  if (!d1) return undefined;
  const row = await d1.prepare("select session_ciphertext, session_iv, session_algorithm, session_key_version from home_network_integrations where id = ?").bind(integration.id).first<EncryptedHomeSecret & { session_ciphertext?: string; session_iv?: string; session_algorithm?: string; session_key_version?: number }>();
  if (!row?.session_ciphertext || !row.session_iv || !row.session_algorithm || !row.session_key_version) return undefined;
  return decryptHomeSecretJson({ ciphertext: row.session_ciphertext, iv: row.session_iv, algorithm: row.session_algorithm as "AES-GCM-256", keyVersion: row.session_key_version as 1 }, `eero:${integration.id}`);
}

export async function listConnectedEeroIntegrations(): Promise<HomeNetworkIntegration[]> {
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare("select * from home_network_integrations where provider = 'eero' and status = 'connected'")
      .all<NetworkRow>();
    if (!result.success) throw new Error(result.error || "Eero integration query failed.");
    return (result.results || []).map(integrationFromRow);
  }
  const store = await readLocalHomesStore();
  return (store.networkIntegrations || []).filter((item) => item.provider === "eero" && item.status === "connected");
}

export async function getNetworkDeviceStates(integrationId: string): Promise<Map<string, { online: boolean; updatedAt: string }>> {
  const d1 = await getHomesD1();
  if (!d1) return new Map();
  const result = await d1
    .prepare("select device_id, online, updated_at from home_network_device_states where integration_id = ?")
    .bind(integrationId)
    .all<{ device_id: string; online: number | boolean; updated_at: string }>();
  if (!result.success) throw new Error(result.error || "Eero device state query failed.");
  return new Map((result.results || []).map((row) => [row.device_id, { online: Boolean(row.online), updatedAt: row.updated_at }]));
}

export async function saveNetworkDeviceState(integrationId: string, deviceId: string, online: boolean, updatedAt: string) {
  const d1 = await getHomesD1();
  if (!d1) return;
  const result = await d1
    .prepare("insert into home_network_device_states (integration_id, device_id, online, updated_at) values (?, ?, ?, ?) on conflict(integration_id, device_id) do update set online = excluded.online, updated_at = excluded.updated_at")
    .bind(integrationId, deviceId, online ? 1 : 0, updatedAt)
    .run();
  assertD1Success(result, "Eero device state could not be saved.");
}
