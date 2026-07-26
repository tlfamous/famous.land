import {
  getEeroSession,
  getHomeNetworkIntegration,
  getNetworkDeviceStates,
  listConnectedEeroIntegrations,
  recordHomeActivity,
  saveHomeNetworkIntegration,
  saveNetworkDeviceState
} from "./activity";
import type { HomeNetworkIntegration } from "./types";

const EERO_API = "https://api-user.e2ro.com/2.2";
const EERO_HOME_ID = "home_lh3";
type Json = Record<string, unknown>;
export type EeroNetwork = { id: string; name: string };
type EeroDevice = { id: string; name: string; online: boolean; raw: Json; metadata: Record<string, string | number | boolean | null> };

function asRecord(value: unknown): Json { return value && typeof value === "object" && !Array.isArray(value) ? value as Json : {}; }
function value(record: Json, ...keys: string[]) { for (const key of keys) if (typeof record[key] === "string" && record[key]) return record[key] as string; }
function bool(record: Json, ...keys: string[]) { for (const key of keys) if (typeof record[key] === "boolean") return record[key] as boolean; }
function redact(login: string) { const at = login.indexOf("@"); return at > 1 ? `${login.slice(0, 2)}•••${login.slice(at)}` : `•••${login.slice(-4)}`; }
function requireEeroHome(homeId: string) { if (homeId !== EERO_HOME_ID) throw new Error("Eero monitoring is configured only for 25 Sunny Cove."); }

async function request(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("accept", "application/json");
  if (token) headers.set("cookie", `s=${token}`);
  const response = await fetch(`${EERO_API}${path}`, { ...init, headers, cache: "no-store" });
  const body = await response.json().catch(() => ({})) as Json;
  if (!response.ok) {
    const detail = value(asRecord(body.error), "message") || value(body, "message") || `Eero request failed (${response.status}).`;
    const error = new Error(detail) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return body;
}

function networks(body: Json): EeroNetwork[] {
  const nested = asRecord(body.data);
  const data = Array.isArray(body.data) ? body.data : Array.isArray(nested.networks) ? nested.networks : Array.isArray(nested.data) ? nested.data : Array.isArray(body.networks) ? body.networks : [];
  return data.map(asRecord).map((network) => ({ id: value(network, "url", "network_id", "id")?.split("/").pop() || "", name: value(network, "name", "display_name") || "Eero network" })).filter((network) => network.id);
}

async function availableNetworks(token: string) {
  const direct = networks(await request("/networks", {}, token));
  if (direct.length) return direct;
  const account = asRecord((await request("/account", {}, token)).data);
  return networks({ data: account.networks });
}

export async function startEeroVerification(homeId: string, login: string) {
  requireEeroHome(homeId);
  const cleaned = login.trim();
  if (!cleaned) throw new Error("Enter the email address or phone number used for Eero.");
  const body = await request("/login", { method: "POST", body: JSON.stringify({ login: cleaned }) });
  const token = value(asRecord(body.data), "user_token");
  if (!token) throw new Error("Eero did not return a verification session. Sign in with an Eero email or phone account, not Amazon.");
  return saveHomeNetworkIntegration({ homeId, provider: "eero", status: "verification_pending", accountHint: redact(cleaned), baselineEstablished: false, lastError: undefined, session: { token, login: cleaned } });
}

export async function verifyEero(homeId: string, code: string): Promise<EeroNetwork[]> {
  requireEeroHome(homeId);
  const session = await getEeroSession(homeId);
  const token = typeof session?.token === "string" ? session.token : undefined;
  if (!token) throw new Error("Start Eero verification again.");
  // A prior successful verification can leave this page without its network
  // chooser if Eero's response shape changes. Prefer recovering that session.
  try {
    const existing = await availableNetworks(token);
    if (existing.length) return existing;
  } catch {
    // The pre-verification session is expected to reject account reads.
  }
  if (!code.trim()) throw new Error("Enter the Eero verification code.");
  await request("/login/verify", { method: "POST", body: JSON.stringify({ code: code.trim() }) }, token);
  return availableNetworks(token);
}

export async function selectEeroNetwork(homeId: string, networkId: string) {
  requireEeroHome(homeId);
  const session = await getEeroSession(homeId);
  const token = typeof session?.token === "string" ? session.token : undefined;
  if (!token) throw new Error("Start Eero verification again.");
  const selected = (await availableNetworks(token)).find((network) => network.id === networkId);
  if (!selected) throw new Error("Choose an Eero network from the verified account.");
  await saveHomeNetworkIntegration({ homeId, provider: "eero", status: "connected", accountHint: (await getHomeNetworkIntegration(homeId))?.accountHint, networkId: selected.id, networkName: selected.name, baselineEstablished: false, lastError: undefined });
  return syncEeroHome(homeId);
}

function deviceList(body: Json): EeroDevice[] {
  const data = asRecord(body.data);
  const items = Array.isArray(body.data) ? body.data : Array.isArray(data.devices) ? data.devices : Array.isArray(body.devices) ? body.devices : [];
  return items.map(asRecord).map((raw) => {
    const id = value(raw, "url", "device_id", "id", "mac")?.split("/").pop() || "";
    const name = value(raw, "nickname", "name", "hostname", "mac") || "Unnamed device";
    const online = bool(raw, "connected", "online", "is_connected") ?? value(raw, "status") === "connected";
    const connection = asRecord(raw.connection);
    return { id, name, online, raw, metadata: { online, connectionType: value(connection, "type", "connection_type") || value(raw, "connection_type") || null, band: value(connection, "band") || value(raw, "band") || null, eero: value(connection, "eero_name") || null } };
  }).filter((device) => device.id);
}

function guestNetworkName(body: Json): string | undefined {
  const data = asRecord(body.data);
  return value(data, "name", "ssid") || value(body, "name", "ssid");
}

function isGuestDevice(device: EeroDevice, guestSsid?: string) {
  const connection = asRecord(device.raw.connection);
  const explicitlyGuest = bool(device.raw, "guest", "is_guest", "guest_network") ?? bool(connection, "guest", "is_guest", "guest_network");
  if (explicitlyGuest === true) return true;
  const ssid = value(connection, "ssid", "network_name") || value(device.raw, "ssid", "network_name");
  return Boolean(guestSsid && ssid && ssid === guestSsid);
}

async function markReauthorization(integration: HomeNetworkIntegration, error: unknown) {
  await saveHomeNetworkIntegration({ ...integration, status: "needs_reauthorization", lastError: "Eero needs to be connected again.", baselineEstablished: integration.baselineEstablished });
}

export async function syncEeroHome(homeId: string) {
  requireEeroHome(homeId);
  const integration = await getHomeNetworkIntegration(homeId);
  if (!integration?.networkId || integration.status !== "connected") throw new Error("Connect Eero before refreshing its activity.");
  const session = await getEeroSession(homeId);
  const token = typeof session?.token === "string" ? session.token : undefined;
  if (!token) { await markReauthorization(integration, undefined); throw new Error("Eero needs to be connected again."); }
  const observedAt = new Date().toISOString();
  let devices: EeroDevice[];
  try {
    const allDevices = await request(`/networks/${encodeURIComponent(integration.networkId)}/devices`, {}, token);
    // This private endpoint is not present for every Eero account. Its absence
    // must never broaden collection to the primary network: we simply rely on
    // Eero's explicit per-device guest marker in that case.
    let guest: Json = {};
    try { guest = await request(`/networks/${encodeURIComponent(integration.networkId)}/guest_network`, {}, token); }
    catch (error) { if ((error as Error & { status?: number }).status !== 404) throw error; }
    devices = deviceList(allDevices).filter((device) => isGuestDevice(device, guestNetworkName(guest)));
  }
  catch (error) { if ((error as Error & { status?: number }).status === 401 || (error as Error & { status?: number }).status === 403) await markReauthorization(integration, error); throw error; }
  const previous = await getNetworkDeviceStates(integration.id);
  let events = 0;
  for (const device of devices) {
    const old = previous.get(device.id);
    if (integration.baselineEstablished && old && old.online !== device.online) {
      const connected = device.online;
      const created = await recordHomeActivity({ homeId, source: "eero", sourceEventId: `${integration.id}:${device.id}:${observedAt}`, eventType: connected ? "network.device.connected" : "network.device.disconnected", occurredAt: observedAt, deviceId: device.id, deviceName: device.name, description: `${device.name} was observed ${connected ? "on" : "off"} the Eero network.`, metadata: device.metadata, sensitive: device.raw });
      if (created) events += 1;
    }
    await saveNetworkDeviceState(integration.id, device.id, device.online, observedAt);
  }
  await saveHomeNetworkIntegration({ ...integration, status: "connected", baselineEstablished: true, lastSyncedAt: observedAt, lastError: undefined });
  return { devices: devices.length, events, baseline: !integration.baselineEstablished };
}

export async function syncConnectedEeros() {
  const integrations = await listConnectedEeroIntegrations();
  const results = await Promise.allSettled(integrations.filter((item) => item.homeId === EERO_HOME_ID).map((item) => syncEeroHome(item.homeId)));
  return { synced: results.filter((result) => result.status === "fulfilled").length, failed: results.filter((result) => result.status === "rejected").length };
}
