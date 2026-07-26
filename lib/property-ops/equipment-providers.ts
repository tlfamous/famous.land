import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  type CognitoUserSession
} from "amazon-cognito-identity-js";
import type {
  DiscoveredHomeDevice,
  EquipmentMetricValue,
  HomeIntegrationProvider
} from "./types";

const REQUEST_TIMEOUT_MS = 20_000;
const MOPEKA_BASE_URL = "https://gateway.mopeka.cloud/app/sensors";
const MOPEKA_USER_POOL_ID = "us-east-1_sLQ1KlStp";
const MOPEKA_CLIENT_ID = "7dafulgmkck7u9hiju6v6p1emt";
const ECONET_BASE_URL = "https://rheem.clearblade.com/api/v/1";
const ECONET_SYSTEM_KEY = "e2e699cb0bb0bbb88fc8858cb5a401";
const ECONET_SYSTEM_SECRET = "E2E699CB0BE6C6FADDB1B0BC9A20";

type Json = Record<string, unknown>;

export type HomeIntegrationCredentials = {
  username: string;
  password: string;
};

export type NormalizedEquipmentReading = {
  externalDeviceId: string;
  externalDeviceName: string;
  externalLocationId?: string;
  externalLocationName?: string;
  observedAt: string;
  sourceUpdatedAt?: string;
  online: boolean;
  metrics: Record<string, EquipmentMetricValue>;
};

export interface ReadOnlyHomeProvider {
  provider: HomeIntegrationProvider;
  discover(credentials: HomeIntegrationCredentials): Promise<DiscoveredHomeDevice[]>;
  read(
    credentials: HomeIntegrationCredentials,
    externalDeviceId: string
  ): Promise<NormalizedEquipmentReading>;
}

export class ProviderAuthenticationError extends Error {
  constructor(message = "The vendor account needs to be connected again.") {
    super(message);
    this.name = "ProviderAuthenticationError";
  }
}

export class ProviderRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderRequestError";
  }
}

function asJson(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : {};
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function number(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function fieldValue(value: unknown): unknown {
  const field = asJson(value);
  return field.value ?? value;
}

function fieldNumber(value: unknown): number | undefined {
  return number(fieldValue(value));
}

function fieldText(value: unknown): string | undefined {
  return text(fieldValue(value));
}

function requireCredentials(credentials: HomeIntegrationCredentials) {
  const username = credentials.username.trim();
  if (!username || !credentials.password) {
    throw new ProviderAuthenticationError("Enter the email and password used by the vendor app.");
  }
  return { username, password: credentials.password };
}

async function fetchJson(url: string, init: RequestInit, allowed: {
  host: string;
  paths: RegExp[];
  methods: string[];
}): Promise<Json> {
  const parsed = new URL(url);
  const method = (init.method || "GET").toUpperCase();
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== allowed.host ||
    !allowed.paths.some((pattern) => pattern.test(parsed.pathname)) ||
    !allowed.methods.includes(method)
  ) {
    throw new ProviderRequestError("Blocked an unexpected vendor request.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(parsed, {
      ...init,
      cache: "no-store",
      signal: controller.signal
    });
    const body = (await response.json().catch(() => ({}))) as Json;
    if (response.status === 401 || response.status === 403) {
      throw new ProviderAuthenticationError();
    }
    if (!response.ok) {
      throw new ProviderRequestError(`The vendor service returned ${response.status}.`);
    }
    return body;
  } catch (error) {
    if (error instanceof ProviderAuthenticationError || error instanceof ProviderRequestError) {
      throw error;
    }
    if ((error as Error).name === "AbortError") {
      throw new ProviderRequestError("The vendor service did not respond within 20 seconds.");
    }
    throw new ProviderRequestError("The vendor service could not be reached.");
  } finally {
    clearTimeout(timeout);
  }
}

async function authenticateMopeka(credentials: HomeIntegrationCredentials): Promise<string> {
  const { username, password } = requireCredentials(credentials);
  const pool = new CognitoUserPool({
    UserPoolId: MOPEKA_USER_POOL_ID,
    ClientId: MOPEKA_CLIENT_ID
  });
  const user = new CognitoUser({ Username: username, Pool: pool });
  const details = new AuthenticationDetails({ Username: username, Password: password });

  return new Promise<string>((resolve, reject) => {
    const unsupported = () =>
      reject(
        new ProviderAuthenticationError(
          "This Mopeka account requires an additional sign-in step that the monitor cannot complete."
        )
      );

    user.authenticateUser(details, {
      onSuccess(session: CognitoUserSession) {
        resolve(session.getAccessToken().getJwtToken());
      },
      onFailure() {
        reject(new ProviderAuthenticationError("Mopeka did not accept that app email and password."));
      },
      newPasswordRequired: unsupported,
      mfaRequired: unsupported,
      totpRequired: unsupported,
      selectMFAType: unsupported,
      mfaSetup: unsupported,
      customChallenge: unsupported
    });
  });
}

async function mopekaRequest(path: string, token: string): Promise<Json> {
  const url = new URL(`${MOPEKA_BASE_URL}${path}`);
  const body = await fetchJson(
    url.toString(),
    {
      headers: {
        Accept: "application/json",
        Auth: token,
        Origin: "app://localhost",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15"
      }
    },
    {
      host: "gateway.mopeka.cloud",
      paths: [/^\/app\/sensors(?:\/[^/]+\/data-shadow)?$/],
      methods: ["GET"]
    }
  );
  return body;
}

function dynamoValue(item: unknown, key: string): unknown {
  const value = asJson(asJson(item)[key]);
  if (typeof value.S === "string") return value.S;
  if (typeof value.N === "string") return number(value.N);
  if (typeof value.BOOL === "boolean") return value.BOOL;
  return undefined;
}

function parseTankType(value: unknown): { capacity?: number; unit?: string } {
  const match = text(value)?.match(/^([\d.]+)\s*([a-zA-Z_]+)$/);
  return match ? { capacity: Number(match[1]), unit: match[2].toLowerCase() } : {};
}

function mopekaFillPercent(levelMeters: number, tankHeight: number, vertical: boolean) {
  if (tankHeight <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, levelMeters / tankHeight));
  if (vertical || ratio <= 0 || ratio >= 1) return Math.round(ratio * 10_000) / 100;
  const radius = tankHeight / 2;
  const height = levelMeters;
  const cylinderScale = 4.5;
  const angle = Math.acos(1 - 2 * ratio);
  const cylinder =
    (angle - (1 - 2 * ratio) * Math.sin(angle)) *
    radius ** 2 *
    cylinderScale *
    radius;
  const heads = (Math.PI * height ** 2 * (3 * radius - height)) / 3;
  const maximum =
    Math.PI * radius ** 2 * cylinderScale * radius + (4 / 3) * Math.PI * radius ** 3;
  return Math.round(((cylinder + heads) / maximum) * 10_000) / 100;
}

function gallonsFromTankType(fillPercent: number, tankType: unknown): number | null {
  const { capacity, unit } = parseTankType(tankType);
  if (!capacity || !unit) return null;
  const litersPerUnit: Record<string, number> = {
    l: 1,
    lb: 0.925,
    gal: 3.78541,
    us_gal: 3.78541,
    imp_gal: 4.54609
  };
  const liters = capacity * (fillPercent / 100) * (litersPerUnit[unit] ?? 1);
  return Math.round((liters / 3.78541) * 100) / 100;
}

export function normalizeMopekaReading(
  rawReading: unknown,
  rawDevice: unknown,
  observedAt = new Date().toISOString()
): NormalizedEquipmentReading {
  const reading = asJson(rawReading);
  const device = asJson(rawDevice);
  const rawLevel = number(dynamoValue(reading, "Value")) ?? 0;
  const levelMeters = rawLevel > 0 ? Math.max(0, rawLevel - 0.017) : 0;
  const tankHeight = number(device.tankHeight) ?? 0;
  const vertical = device.vertical === true;
  const fillPercent = mopekaFillPercent(levelMeters, tankHeight, vertical);
  const timestampMs = number(dynamoValue(reading, "Timestamp"));
  const temperatureC = number(dynamoValue(reading, "Temp"));
  const sourceUpdatedAt = timestampMs ? new Date(timestampMs).toISOString() : undefined;
  const externalDeviceId = text(device.address);
  if (!externalDeviceId) throw new ProviderRequestError("Mopeka returned a sensor without an ID.");

  return {
    externalDeviceId,
    externalDeviceName: text(device.name) || "Mopeka propane sensor",
    observedAt,
    sourceUpdatedAt,
    online: Boolean(sourceUpdatedAt),
    metrics: {
      fillPercent,
      estimatedGallons: gallonsFromTankType(fillPercent, device.tankType),
      batteryVoltage: number(dynamoValue(reading, "BatteryLevel")) ?? null,
      signalQuality: number(dynamoValue(reading, "Quality")) ?? null,
      temperatureF:
        temperatureC === undefined ? null : Math.round((temperatureC * 9) / 5 + 32),
      levelInches: Math.round(levelMeters * 39.3701 * 100) / 100,
      bridgeId: text(dynamoValue(reading, "Source")) || null,
      tankType: text(device.tankType) || null
    }
  };
}

function mopekaDevices(body: Json): Json[] {
  return Array.isArray(body.devices) ? body.devices.map(asJson) : [];
}

async function discoverMopeka(credentials: HomeIntegrationCredentials) {
  const token = await authenticateMopeka(credentials);
  const body = await mopekaRequest(`?_=${Date.now()}`, token);
  return mopekaDevices(body)
    .map((device) => ({
      id: text(device.address) || "",
      name: text(device.name) || "Mopeka sensor",
      metadata: {
        tankType: text(device.tankType) || null,
        modelNumber: text(device.modelNumber) || null
      }
    }))
    .filter((device) => device.id);
}

async function readMopeka(
  credentials: HomeIntegrationCredentials,
  externalDeviceId: string
) {
  const token = await authenticateMopeka(credentials);
  const deviceBody = await mopekaRequest(`?_=${Date.now()}`, token);
  const device = mopekaDevices(deviceBody).find(
    (candidate) => text(candidate.address) === externalDeviceId
  );
  if (!device) throw new ProviderRequestError("The selected Mopeka sensor is no longer available.");
  const shadow = await mopekaRequest(
    `/${encodeURIComponent(externalDeviceId)}/data-shadow?limit=1&shadowLimit=1`,
    token
  );
  const timeSeries = asJson(shadow.timeSeries);
  const reading = Array.isArray(timeSeries.Items) ? timeSeries.Items[0] : undefined;
  if (!reading) throw new ProviderRequestError("Mopeka did not return a current sensor reading.");
  return normalizeMopekaReading(reading, device);
}

async function econetData(credentials: HomeIntegrationCredentials): Promise<Json[]> {
  const { username, password } = requireCredentials(credentials);
  const headers = {
    "ClearBlade-SystemKey": ECONET_SYSTEM_KEY,
    "ClearBlade-SystemSecret": ECONET_SYSTEM_SECRET,
    "Content-Type": "application/json; charset=UTF-8"
  };
  const authentication = await fetchJson(
    `${ECONET_BASE_URL}/user/auth`,
    { method: "POST", headers, body: JSON.stringify({ email: username, password }) },
    {
      host: "rheem.clearblade.com",
      paths: [/^\/api\/v\/1\/user\/auth$/],
      methods: ["POST"]
    }
  );
  const options = asJson(authentication.options);
  if (options.success !== true || !text(authentication.user_token)) {
    throw new ProviderAuthenticationError("EcoNet did not accept that app email and password.");
  }
  const userToken = text(authentication.user_token);
  if (!userToken) throw new ProviderAuthenticationError();

  const data = await fetchJson(
    `${ECONET_BASE_URL}/code/${ECONET_SYSTEM_KEY}/getUserDataForApp`,
    {
      method: "POST",
      headers: { ...headers, "ClearBlade-UserToken": userToken },
      body: JSON.stringify({ resource: "friedrich" })
    },
    {
      host: "rheem.clearblade.com",
      paths: [new RegExp(`^/api/v/1/code/${ECONET_SYSTEM_KEY}/getUserDataForApp$`)],
      methods: ["POST"]
    }
  );
  const results = asJson(data.results);
  if (data.success !== true || !Array.isArray(results.locations)) {
    throw new ProviderRequestError("EcoNet returned an unexpected account response.");
  }
  return results.locations.map(asJson);
}

function locationEquipment(location: Json): Json[] {
  return Array.isArray(location.equiptments) ? location.equiptments.map(asJson) : [];
}

function econetName(equipment: Json) {
  return fieldText(equipment["@NAME"]) || "EcoNet water heater";
}

function econetDeviceId(equipment: Json) {
  return (
    text(equipment.serial_number) ||
    text(equipment.device_name) ||
    text(equipment.mac_address)
  );
}

function econetMode(equipment: Json): string | null {
  const mode = asJson(equipment["@MODE"]);
  if (text(mode.status)) return text(mode.status) || null;
  const index = number(mode.value);
  const constraints = asJson(mode.constraints);
  const choices = Array.isArray(constraints.enumText) ? constraints.enumText : [];
  return index === undefined ? null : text(choices[index]) || null;
}

function hotWaterAvailability(value: unknown): number | null {
  const icon = text(value) || "";
  if (icon.includes("hundread_percent")) return 100;
  if (icon.includes("fourty_percent")) return 66;
  if (icon.includes("ten_percent")) return 33;
  if (icon.includes("empty") || icon.includes("zero_percent")) return 0;
  return null;
}

function shutoffValveOpen(value: unknown): boolean | null {
  const title = text(asJson(value).title);
  if (title === "Shut-OFF Valve - Open") return true;
  if (title === "Shut-OFF Valve - Closed") return false;
  return null;
}

export function normalizeEcoNetReading(
  rawEquipment: unknown,
  rawLocation: unknown,
  observedAt = new Date().toISOString()
): NormalizedEquipmentReading {
  const equipment = asJson(rawEquipment);
  const location = asJson(rawLocation);
  const externalDeviceId = econetDeviceId(equipment);
  if (!externalDeviceId) throw new ProviderRequestError("EcoNet returned a heater without an ID.");
  const connected = equipment["@CONNECTED"] !== false;

  return {
    externalDeviceId,
    externalDeviceName: econetName(equipment),
    externalLocationId: text(location.location_id),
    externalLocationName: text(location["@LOCATION_NAME"]) || "EcoNet location",
    observedAt,
    online: connected,
    metrics: {
      connected,
      mode: econetMode(equipment),
      setPointF: fieldNumber(equipment["@SETPOINT"]) ?? null,
      running: Boolean(text(equipment["@RUNNING"])),
      runningState: text(equipment["@RUNNING"]) || null,
      hotWaterPercent: hotWaterAvailability(equipment["@HOTWATER"]),
      tankHealth: fieldNumber(equipment["@TANK"]) ?? null,
      combustionHealth: fieldNumber(equipment["@COMBUSTION"]) ?? null,
      shutoffValveOpen: shutoffValveOpen(equipment["@VALVESTATUS"]),
      alertCount: number(equipment["@ALERTCOUNT"]) ?? 0,
      enabled: fieldNumber(equipment["@ENABLED"]) === undefined
        ? null
        : fieldNumber(equipment["@ENABLED"]) === 1
    }
  };
}

async function discoverEcoNet(credentials: HomeIntegrationCredentials) {
  const locations = await econetData(credentials);
  return locations.flatMap((location) =>
    locationEquipment(location)
      .filter((equipment) => equipment.device_type === "WH")
      .map((equipment) => ({
        id: econetDeviceId(equipment) || "",
        name: econetName(equipment),
        locationId: text(location.location_id),
        locationName: text(location["@LOCATION_NAME"]) || "EcoNet location",
        metadata: {
          genericType: text(equipment["@TYPE"]) || null
        }
      }))
      .filter((device) => device.id)
  );
}

async function readEcoNet(
  credentials: HomeIntegrationCredentials,
  externalDeviceId: string
) {
  const locations = await econetData(credentials);
  for (const location of locations) {
    const equipment = locationEquipment(location).find(
      (candidate) => candidate.device_type === "WH" && econetDeviceId(candidate) === externalDeviceId
    );
    if (equipment) return normalizeEcoNetReading(equipment, location);
  }
  throw new ProviderRequestError("The selected EcoNet water heater is no longer available.");
}

const providers: Record<HomeIntegrationProvider, ReadOnlyHomeProvider> = {
  mopeka: {
    provider: "mopeka",
    discover: discoverMopeka,
    read: readMopeka
  },
  econet: {
    provider: "econet",
    discover: discoverEcoNet,
    read: readEcoNet
  }
};

export function getReadOnlyHomeProvider(provider: HomeIntegrationProvider) {
  return providers[provider];
}

export function isHomeIntegrationProvider(value: unknown): value is HomeIntegrationProvider {
  return value === "mopeka" || value === "econet";
}
