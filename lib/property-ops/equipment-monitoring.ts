import { decryptHomeSecretJson, encryptHomeSecretJson } from "./crypto";
import {
  getReadOnlyHomeProvider,
  ProviderAuthenticationError,
  type HomeIntegrationCredentials,
  type NormalizedEquipmentReading
} from "./equipment-providers";
import { recordHomeActivity } from "./activity";
import {
  assertD1Success,
  getHomesD1,
  mutateLocalHomesStore,
  readLocalHomesStore
} from "./storage";
import type {
  DiscoveredHomeDevice,
  EncryptedHomeSecret,
  HomeAlert,
  HomeAlertSeverity,
  HomeEquipmentReading,
  HomeIntegration,
  HomeIntegrationProvider,
  PortfolioHomeAlert,
  StoredHomeSecret
} from "./types";

type IntegrationRow = {
  id: string;
  home_id: string;
  provider: HomeIntegrationProvider;
  status: HomeIntegration["status"];
  account_hint: string | null;
  external_device_id: string | null;
  external_device_name: string | null;
  external_location_id: string | null;
  external_location_name: string | null;
  metadata_json: string | null;
  poll_interval_minutes: number;
  consecutive_failures: number;
  last_attempt_at: string | null;
  last_success_at: string | null;
  next_poll_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

type IntegrationSecretRow = {
  credentials_ciphertext: string;
  credentials_iv: string;
  credentials_algorithm: string;
  credentials_key_version: number;
};

type ReadingRow = {
  id: string;
  home_id: string;
  integration_id: string;
  provider: HomeIntegrationProvider;
  external_device_id: string;
  observed_at: string;
  source_updated_at: string | null;
  online: number | boolean;
  metrics_json: string;
  created_at: string;
};

type AlertRow = {
  id: string;
  home_id: string;
  integration_id: string;
  provider: HomeIntegrationProvider;
  device_name: string;
  dedupe_key: string;
  alert_type: string;
  severity: HomeAlert["severity"];
  status: HomeAlert["status"];
  title: string;
  description: string;
  opened_at: string;
  last_observed_at: string;
  acknowledged_at: string | null;
  acknowledged_by_session_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

type AlertWithHomeRow = AlertRow & {
  home_name: string;
  home_code: string;
};

type AlertCondition = {
  integration: HomeIntegration;
  alertType: string;
  severity: HomeAlertSeverity;
  active: boolean;
  title: string;
  description: string;
  observedAt: string;
};

const READINGS_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const SOURCE_STALE_MS = 6 * 60 * 60 * 1000;

export function isLowPropaneAlertActive(
  fillPercent: number | undefined,
  wasActive: boolean
) {
  return (
    fillPercent !== undefined &&
    (fillPercent < 30 || (wasActive && fillPercent < 35))
  );
}

export function isMopekaSourceStale(
  observedAt: string,
  sourceUpdatedAt: string | undefined
) {
  if (!sourceUpdatedAt) return true;
  return (
    new Date(observedAt).valueOf() - new Date(sourceUpdatedAt).valueOf() >
    SOURCE_STALE_MS
  );
}

export function shouldOpenUnavailableAlert(
  consecutiveFailures: number,
  authenticationFailure: boolean
) {
  return !authenticationFailure && consecutiveFailures >= 2;
}

function integrationFromRow(row: IntegrationRow): HomeIntegration {
  return {
    id: row.id,
    homeId: row.home_id,
    provider: row.provider,
    status: row.status,
    ...(row.account_hint ? { accountHint: row.account_hint } : {}),
    ...(row.external_device_id ? { externalDeviceId: row.external_device_id } : {}),
    ...(row.external_device_name ? { externalDeviceName: row.external_device_name } : {}),
    ...(row.external_location_id ? { externalLocationId: row.external_location_id } : {}),
    ...(row.external_location_name ? { externalLocationName: row.external_location_name } : {}),
    ...(row.metadata_json
      ? {
          metadata: JSON.parse(row.metadata_json) as HomeIntegration["metadata"]
        }
      : {}),
    pollIntervalMinutes: row.poll_interval_minutes,
    consecutiveFailures: row.consecutive_failures,
    ...(row.last_attempt_at ? { lastAttemptAt: row.last_attempt_at } : {}),
    ...(row.last_success_at ? { lastSuccessAt: row.last_success_at } : {}),
    ...(row.next_poll_at ? { nextPollAt: row.next_poll_at } : {}),
    ...(row.last_error ? { lastError: row.last_error } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function readingFromRow(row: ReadingRow): HomeEquipmentReading {
  return {
    id: row.id,
    homeId: row.home_id,
    integrationId: row.integration_id,
    provider: row.provider,
    externalDeviceId: row.external_device_id,
    observedAt: row.observed_at,
    ...(row.source_updated_at ? { sourceUpdatedAt: row.source_updated_at } : {}),
    online: Boolean(row.online),
    metrics: JSON.parse(row.metrics_json) as HomeEquipmentReading["metrics"],
    createdAt: row.created_at
  };
}

function alertFromRow(row: AlertRow): HomeAlert {
  return {
    id: row.id,
    homeId: row.home_id,
    integrationId: row.integration_id,
    provider: row.provider,
    deviceName: row.device_name,
    dedupeKey: row.dedupe_key,
    alertType: row.alert_type,
    severity: row.severity,
    status: row.status,
    title: row.title,
    description: row.description,
    openedAt: row.opened_at,
    lastObservedAt: row.last_observed_at,
    ...(row.acknowledged_at ? { acknowledgedAt: row.acknowledged_at } : {}),
    ...(row.acknowledged_by_session_id
      ? { acknowledgedBySessionId: row.acknowledged_by_session_id }
      : {}),
    ...(row.resolved_at ? { resolvedAt: row.resolved_at } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function hintAccount(username: string) {
  const at = username.indexOf("@");
  if (at > 1) return `${username.slice(0, 2)}•••${username.slice(at)}`;
  return `•••${username.slice(-4)}`;
}

function nextPoll(observedAt: string, minutes = 60) {
  return new Date(new Date(observedAt).valueOf() + minutes * 60_000).toISOString();
}

function secretName(integrationId: string) {
  return `integration_credentials:${integrationId}`;
}

async function assertHome(homeId: string) {
  const { getHome } = await import("./repository");
  if (!(await getHome(homeId))) throw new Error("Home not found.");
}

export async function listHomeIntegrations(homeId: string): Promise<HomeIntegration[]> {
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare("select * from home_integrations where home_id = ? order by provider asc")
      .bind(homeId)
      .all<IntegrationRow>();
    if (!result.success) throw new Error(result.error || "Equipment integrations could not be read.");
    return (result.results || []).map(integrationFromRow);
  }
  const store = await readLocalHomesStore();
  return structuredClone((store.integrations || []).filter((item) => item.homeId === homeId));
}

export async function getHomeIntegration(
  homeId: string,
  integrationId: string
): Promise<HomeIntegration | undefined> {
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare("select * from home_integrations where home_id = ? and id = ?")
      .bind(homeId, integrationId)
      .first<IntegrationRow>();
    return row ? integrationFromRow(row) : undefined;
  }
  const store = await readLocalHomesStore();
  const integration = (store.integrations || []).find(
    (item) => item.homeId === homeId && item.id === integrationId
  );
  return integration ? structuredClone(integration) : undefined;
}

async function getIntegrationByProvider(
  homeId: string,
  provider: HomeIntegrationProvider
): Promise<HomeIntegration | undefined> {
  return (await listHomeIntegrations(homeId)).find((item) => item.provider === provider);
}

async function credentialsForIntegration(
  integration: HomeIntegration
): Promise<HomeIntegrationCredentials> {
  const context = `integration:${integration.id}`;
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare(
        `select credentials_ciphertext, credentials_iv, credentials_algorithm,
                credentials_key_version
         from home_integrations where id = ?`
      )
      .bind(integration.id)
      .first<IntegrationSecretRow>();
    if (!row) throw new Error("The integration credentials are missing.");
    return decryptHomeSecretJson<HomeIntegrationCredentials>(
      {
        ciphertext: row.credentials_ciphertext,
        iv: row.credentials_iv,
        algorithm: row.credentials_algorithm as EncryptedHomeSecret["algorithm"],
        keyVersion: row.credentials_key_version as EncryptedHomeSecret["keyVersion"]
      },
      context
    );
  }
  const store = await readLocalHomesStore();
  const stored = store.secrets.find(
    (item) => item.homeId === integration.homeId && item.secretName === secretName(integration.id)
  );
  if (!stored) throw new Error("The integration credentials are missing.");
  return decryptHomeSecretJson<HomeIntegrationCredentials>(stored, context);
}

async function saveIntegration(
  integration: HomeIntegration,
  credentials?: HomeIntegrationCredentials
) {
  const encrypted = credentials
    ? await encryptHomeSecretJson(credentials, `integration:${integration.id}`)
    : undefined;
  const d1 = await getHomesD1();
  if (d1) {
    if (!encrypted) {
      const result = await d1
        .prepare(
          `update home_integrations set
             status = ?, account_hint = ?, external_device_id = ?, external_device_name = ?,
             external_location_id = ?, external_location_name = ?, metadata_json = ?,
             poll_interval_minutes = ?, consecutive_failures = ?, last_attempt_at = ?,
             last_success_at = ?, next_poll_at = ?, last_error = ?, updated_at = ?
           where id = ? and home_id = ?`
        )
        .bind(
          integration.status,
          integration.accountHint ?? null,
          integration.externalDeviceId ?? null,
          integration.externalDeviceName ?? null,
          integration.externalLocationId ?? null,
          integration.externalLocationName ?? null,
          integration.metadata ? JSON.stringify(integration.metadata) : null,
          integration.pollIntervalMinutes,
          integration.consecutiveFailures,
          integration.lastAttemptAt ?? null,
          integration.lastSuccessAt ?? null,
          integration.nextPollAt ?? null,
          integration.lastError ?? null,
          integration.updatedAt,
          integration.id,
          integration.homeId
        )
        .run();
      assertD1Success(result, "The equipment integration could not be saved.");
      return;
    }

    const result = await d1
      .prepare(
        `insert into home_integrations (
           id, home_id, provider, status, account_hint, external_device_id,
           external_device_name, external_location_id, external_location_name,
           metadata_json, credentials_ciphertext, credentials_iv, credentials_algorithm,
           credentials_key_version, poll_interval_minutes, consecutive_failures,
           last_attempt_at, last_success_at, next_poll_at, last_error, created_at, updated_at
         ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         on conflict(home_id, provider) do update set
           status = excluded.status,
           account_hint = excluded.account_hint,
           external_device_id = excluded.external_device_id,
           external_device_name = excluded.external_device_name,
           external_location_id = excluded.external_location_id,
           external_location_name = excluded.external_location_name,
           metadata_json = excluded.metadata_json,
           credentials_ciphertext = excluded.credentials_ciphertext,
           credentials_iv = excluded.credentials_iv,
           credentials_algorithm = excluded.credentials_algorithm,
           credentials_key_version = excluded.credentials_key_version,
           poll_interval_minutes = excluded.poll_interval_minutes,
           consecutive_failures = excluded.consecutive_failures,
           last_attempt_at = excluded.last_attempt_at,
           last_success_at = excluded.last_success_at,
           next_poll_at = excluded.next_poll_at,
           last_error = excluded.last_error,
           updated_at = excluded.updated_at`
      )
      .bind(
        integration.id,
        integration.homeId,
        integration.provider,
        integration.status,
        integration.accountHint ?? null,
        integration.externalDeviceId ?? null,
        integration.externalDeviceName ?? null,
        integration.externalLocationId ?? null,
        integration.externalLocationName ?? null,
        integration.metadata ? JSON.stringify(integration.metadata) : null,
        encrypted.ciphertext,
        encrypted.iv,
        encrypted.algorithm,
        encrypted.keyVersion,
        integration.pollIntervalMinutes,
        integration.consecutiveFailures,
        integration.lastAttemptAt ?? null,
        integration.lastSuccessAt ?? null,
        integration.nextPollAt ?? null,
        integration.lastError ?? null,
        integration.createdAt,
        integration.updatedAt
      )
      .run();
    assertD1Success(result, "The equipment integration could not be saved.");
    return;
  }

  await mutateLocalHomesStore((store) => {
    store.integrations ??= [];
    const index = store.integrations.findIndex(
      (item) => item.homeId === integration.homeId && item.provider === integration.provider
    );
    if (index >= 0) store.integrations[index] = structuredClone(integration);
    else store.integrations.push(structuredClone(integration));

    if (encrypted) {
      const now = new Date().toISOString();
      const stored: StoredHomeSecret = {
        id: `integration:${integration.id}`,
        homeId: integration.homeId,
        secretName: secretName(integration.id),
        ...encrypted,
        createdAt: now,
        updatedAt: now
      };
      const secretIndex = store.secrets.findIndex(
        (item) => item.homeId === integration.homeId && item.secretName === stored.secretName
      );
      if (secretIndex >= 0) {
        stored.createdAt = store.secrets[secretIndex].createdAt;
        store.secrets[secretIndex] = stored;
      } else {
        store.secrets.push(stored);
      }
    }
  });
}

export async function connectHomeIntegration(
  homeId: string,
  provider: HomeIntegrationProvider,
  credentials: HomeIntegrationCredentials
): Promise<{ integration: HomeIntegration; devices: DiscoveredHomeDevice[] }> {
  await assertHome(homeId);
  const cleaned = {
    username: credentials.username.trim(),
    password: credentials.password
  };
  const devices = await getReadOnlyHomeProvider(provider).discover(cleaned);
  if (!devices.length) {
    throw new Error(
      provider === "mopeka"
        ? "No cloud-connected Mopeka sensor was found on that account."
        : "No EcoNet water heater was found on that account."
    );
  }

  const existing = await getIntegrationByProvider(homeId, provider);
  const now = new Date().toISOString();
  const selected = devices.length === 1 ? devices[0] : undefined;
  const integration: HomeIntegration = {
    id: existing?.id || crypto.randomUUID(),
    homeId,
    provider,
    status: selected ? "connected" : "verification_pending",
    accountHint: hintAccount(cleaned.username),
    ...(selected
      ? {
          externalDeviceId: selected.id,
          externalDeviceName: selected.name,
          externalLocationId: selected.locationId,
          externalLocationName: selected.locationName,
          metadata: selected.metadata
        }
      : {}),
    pollIntervalMinutes: 60,
    consecutiveFailures: 0,
    nextPollAt: now,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  await saveIntegration(integration, cleaned);
  if (selected) await syncHomeIntegration(homeId, integration.id);
  return {
    integration: (await getHomeIntegration(homeId, integration.id)) || integration,
    devices
  };
}

export async function selectHomeIntegrationDevice(
  homeId: string,
  integrationId: string,
  externalDeviceId: string
) {
  const integration = await getHomeIntegration(homeId, integrationId);
  if (!integration) throw new Error("Equipment integration not found.");
  const credentials = await credentialsForIntegration(integration);
  const devices = await getReadOnlyHomeProvider(integration.provider).discover(credentials);
  const selected = devices.find((device) => device.id === externalDeviceId);
  if (!selected) throw new Error("Choose a device returned by the connected vendor account.");
  const now = new Date().toISOString();
  await saveIntegration({
    ...integration,
    status: "connected",
    externalDeviceId: selected.id,
    externalDeviceName: selected.name,
    externalLocationId: selected.locationId,
    externalLocationName: selected.locationName,
    metadata: selected.metadata,
    consecutiveFailures: 0,
    nextPollAt: now,
    lastError: undefined,
    updatedAt: now
  });
  return syncHomeIntegration(homeId, integration.id);
}

export async function disconnectHomeIntegration(homeId: string, integrationId: string) {
  const integration = await getHomeIntegration(homeId, integrationId);
  if (!integration) throw new Error("Equipment integration not found.");
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare("delete from home_integrations where id = ? and home_id = ?")
      .bind(integrationId, homeId)
      .run();
    assertD1Success(result, "The equipment integration could not be disconnected.");
    return;
  }
  await mutateLocalHomesStore((store) => {
    store.integrations = (store.integrations || []).filter((item) => item.id !== integrationId);
    store.equipmentReadings = (store.equipmentReadings || []).filter(
      (item) => item.integrationId !== integrationId
    );
    store.alerts = (store.alerts || []).filter((item) => item.integrationId !== integrationId);
    store.secrets = store.secrets.filter(
      (item) => item.secretName !== secretName(integrationId)
    );
  });
}

async function saveReading(
  integration: HomeIntegration,
  reading: NormalizedEquipmentReading
): Promise<HomeEquipmentReading> {
  const stored: HomeEquipmentReading = {
    id: `${integration.id}:${reading.observedAt}`,
    homeId: integration.homeId,
    integrationId: integration.id,
    provider: integration.provider,
    externalDeviceId: reading.externalDeviceId,
    observedAt: reading.observedAt,
    sourceUpdatedAt: reading.sourceUpdatedAt,
    online: reading.online,
    metrics: reading.metrics,
    createdAt: new Date().toISOString()
  };
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare(
        `insert or ignore into home_equipment_readings (
           id, home_id, integration_id, provider, external_device_id, observed_at,
           source_updated_at, online, metrics_json, created_at
         ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        stored.id,
        stored.homeId,
        stored.integrationId,
        stored.provider,
        stored.externalDeviceId,
        stored.observedAt,
        stored.sourceUpdatedAt ?? null,
        stored.online ? 1 : 0,
        JSON.stringify(stored.metrics),
        stored.createdAt
      )
      .run();
    assertD1Success(result, "The equipment reading could not be stored.");
    return stored;
  }
  await mutateLocalHomesStore((store) => {
    store.equipmentReadings ??= [];
    if (!store.equipmentReadings.some((item) => item.id === stored.id)) {
      store.equipmentReadings.push(stored);
    }
  });
  return stored;
}

async function activeAlert(dedupeKey: string): Promise<HomeAlert | undefined> {
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare(
        "select * from home_alerts where dedupe_key = ? and status in ('open', 'acknowledged')"
      )
      .bind(dedupeKey)
      .first<AlertRow>();
    return row ? alertFromRow(row) : undefined;
  }
  const store = await readLocalHomesStore();
  const alert = (store.alerts || []).find(
    (item) => item.dedupeKey === dedupeKey && item.status !== "resolved"
  );
  return alert ? structuredClone(alert) : undefined;
}

async function applyAlertCondition(condition: AlertCondition): Promise<HomeAlert | undefined> {
  const dedupeKey = `${condition.integration.id}:${condition.alertType}`;
  const current = await activeAlert(dedupeKey);
  const now = condition.observedAt;
  const d1 = await getHomesD1();

  if (condition.active && current) {
    if (d1) {
      const result = await d1
        .prepare(
          `update home_alerts set severity = ?, title = ?, description = ?,
             last_observed_at = ?, updated_at = ? where id = ?`
        )
        .bind(
          condition.severity,
          condition.title,
          condition.description,
          now,
          now,
          current.id
        )
        .run();
      assertD1Success(result, "The equipment alert could not be refreshed.");
    } else {
      await mutateLocalHomesStore((store) => {
        const alert = (store.alerts || []).find((item) => item.id === current.id);
        if (alert) {
          alert.severity = condition.severity;
          alert.title = condition.title;
          alert.description = condition.description;
          alert.lastObservedAt = now;
          alert.updatedAt = now;
        }
      });
    }
    return { ...current, ...condition, dedupeKey, lastObservedAt: now, updatedAt: now };
  }

  if (condition.active) {
    const alert: HomeAlert = {
      id: crypto.randomUUID(),
      homeId: condition.integration.homeId,
      integrationId: condition.integration.id,
      provider: condition.integration.provider,
      deviceName:
        condition.integration.externalDeviceName ||
        (condition.integration.provider === "mopeka" ? "Propane monitor" : "Water heater"),
      dedupeKey,
      alertType: condition.alertType,
      severity: condition.severity,
      status: "open",
      title: condition.title,
      description: condition.description,
      openedAt: now,
      lastObservedAt: now,
      createdAt: now,
      updatedAt: now
    };
    if (d1) {
      const result = await d1
        .prepare(
          `insert into home_alerts (
             id, home_id, integration_id, provider, device_name, dedupe_key, alert_type,
             severity, status, title, description, opened_at, last_observed_at,
             created_at, updated_at
           ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          alert.id,
          alert.homeId,
          alert.integrationId,
          alert.provider,
          alert.deviceName,
          alert.dedupeKey,
          alert.alertType,
          alert.severity,
          alert.status,
          alert.title,
          alert.description,
          alert.openedAt,
          alert.lastObservedAt,
          alert.createdAt,
          alert.updatedAt
        )
        .run();
      assertD1Success(result, "The equipment alert could not be opened.");
    } else {
      await mutateLocalHomesStore((store) => {
        store.alerts ??= [];
        store.alerts.push(alert);
      });
    }
    await recordHomeActivity({
      homeId: alert.homeId,
      source: alert.provider,
      sourceEventId: `${alert.id}:opened`,
      eventType: "alert.opened",
      occurredAt: now,
      deviceId: condition.integration.externalDeviceId,
      deviceName: alert.deviceName,
      description: `${alert.title}: ${alert.description}`,
      metadata: { alertId: alert.id, alertType: alert.alertType, severity: alert.severity }
    });
    return alert;
  }

  if (!current) return undefined;
  if (d1) {
    const result = await d1
      .prepare(
        `update home_alerts set status = 'resolved', resolved_at = ?,
           last_observed_at = ?, updated_at = ? where id = ?`
      )
      .bind(now, now, now, current.id)
      .run();
    assertD1Success(result, "The equipment alert could not be resolved.");
  } else {
    await mutateLocalHomesStore((store) => {
      const alert = (store.alerts || []).find((item) => item.id === current.id);
      if (alert) {
        alert.status = "resolved";
        alert.resolvedAt = now;
        alert.lastObservedAt = now;
        alert.updatedAt = now;
      }
    });
  }
  await recordHomeActivity({
    homeId: current.homeId,
    source: current.provider,
    sourceEventId: `${current.id}:resolved`,
    eventType: "alert.resolved",
    occurredAt: now,
    deviceId: condition.integration.externalDeviceId,
    deviceName: current.deviceName,
    description: `${current.title} cleared.`,
    metadata: { alertId: current.id, alertType: current.alertType, severity: current.severity }
  });
  return { ...current, status: "resolved", resolvedAt: now, updatedAt: now };
}

function metricNumber(reading: HomeEquipmentReading, key: string) {
  const value = reading.metrics[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

async function evaluateReading(integration: HomeIntegration, reading: HomeEquipmentReading) {
  const deviceName =
    integration.externalDeviceName ||
    (integration.provider === "mopeka" ? "Propane monitor" : "Water heater");

  await applyAlertCondition({
    integration,
    alertType: "integration.authentication",
    severity: "warning",
    active: false,
    title: `${deviceName} needs to be reconnected`,
    description: "The vendor account did not accept the saved sign-in.",
    observedAt: reading.observedAt
  });
  await applyAlertCondition({
    integration,
    alertType: "integration.unavailable",
    severity: "warning",
    active: false,
    title: `${deviceName} could not be checked`,
    description: "Two scheduled checks could not reach the vendor service.",
    observedAt: reading.observedAt
  });

  if (integration.provider === "mopeka") {
    const fillPercent = metricNumber(reading, "fillPercent");
    const lowKey = `${integration.id}:propane.low`;
    const lowWasActive = Boolean(await activeAlert(lowKey));
    const lowIsActive = isLowPropaneAlertActive(fillPercent, lowWasActive);
    await applyAlertCondition({
      integration,
      alertType: "propane.low",
      severity: "warning",
      active: lowIsActive,
      title: "Propane is below 30%",
      description:
        fillPercent === undefined
          ? "The propane level could not be calculated."
          : `The latest tank reading is ${Math.round(fillPercent)}%.`,
      observedAt: reading.observedAt
    });

    await applyAlertCondition({
      integration,
      alertType: "propane.stale",
      severity: "warning",
      active: isMopekaSourceStale(reading.observedAt, reading.sourceUpdatedAt),
      title: "Propane monitor has stopped updating",
      description: "Mopeka's latest source reading is more than six hours old.",
      observedAt: reading.observedAt
    });
    return;
  }

  const alertCount = metricNumber(reading, "alertCount") ?? 0;
  await applyAlertCondition({
    integration,
    alertType: "econet.vendor_alert",
    severity: "critical",
    active: alertCount > 0,
    title: "EcoNet reports an active water-heater alert",
    description:
      alertCount > 0
        ? `EcoNet reports ${alertCount} active ${alertCount === 1 ? "alert" : "alerts"}. Open the EcoNet app for the vendor's leak or fault details.`
        : "EcoNet reports no active equipment alerts.",
    observedAt: reading.observedAt
  });
  await applyAlertCondition({
    integration,
    alertType: "econet.offline",
    severity: "warning",
    active: !reading.online,
    title: "Water heater is offline",
    description: "EcoNet reports that the water heater is disconnected.",
    observedAt: reading.observedAt
  });
}

async function recordInitialConnection(integration: HomeIntegration, observedAt: string) {
  if (integration.lastSuccessAt) return;
  await recordHomeActivity({
    homeId: integration.homeId,
    source: integration.provider,
    sourceEventId: `${integration.id}:connected`,
    eventType: "integration.connected",
    occurredAt: observedAt,
    deviceId: integration.externalDeviceId,
    deviceName: integration.externalDeviceName,
    description: `${integration.externalDeviceName || "Equipment"} monitoring connected.`
  });
}

export async function syncHomeIntegration(homeId: string, integrationId: string) {
  const integration = await getHomeIntegration(homeId, integrationId);
  if (!integration) throw new Error("Equipment integration not found.");
  if (!integration.externalDeviceId) throw new Error("Choose a vendor device before refreshing.");
  const credentials = await credentialsForIntegration(integration);
  const attemptedAt = new Date().toISOString();

  try {
    const normalized = await getReadOnlyHomeProvider(integration.provider).read(
      credentials,
      integration.externalDeviceId
    );
    const reading = await saveReading(integration, normalized);
    const updated: HomeIntegration = {
      ...integration,
      status: "connected",
      externalDeviceName: normalized.externalDeviceName,
      externalLocationId: normalized.externalLocationId || integration.externalLocationId,
      externalLocationName: normalized.externalLocationName || integration.externalLocationName,
      consecutiveFailures: 0,
      lastAttemptAt: attemptedAt,
      lastSuccessAt: normalized.observedAt,
      nextPollAt: nextPoll(normalized.observedAt, integration.pollIntervalMinutes),
      lastError: undefined,
      updatedAt: normalized.observedAt
    };
    await saveIntegration(updated);
    await evaluateReading(updated, reading);
    await recordInitialConnection(integration, normalized.observedAt);
    return { integration: updated, reading };
  } catch (error) {
    const authentication = error instanceof ProviderAuthenticationError;
    const failures = integration.consecutiveFailures + 1;
    const message = authentication
      ? "The vendor account needs to be connected again."
      : error instanceof Error
        ? error.message
        : "The vendor service could not be reached.";
    const updated: HomeIntegration = {
      ...integration,
      status: authentication ? "needs_reauthorization" : "error",
      consecutiveFailures: failures,
      lastAttemptAt: attemptedAt,
      nextPollAt: nextPoll(attemptedAt, integration.pollIntervalMinutes),
      lastError: message,
      updatedAt: attemptedAt
    };
    await saveIntegration(updated);
    const deviceName =
      updated.externalDeviceName ||
      (updated.provider === "mopeka" ? "Propane monitor" : "Water heater");
    await applyAlertCondition({
      integration: updated,
      alertType: "integration.authentication",
      severity: "warning",
      active: authentication,
      title: `${deviceName} needs to be reconnected`,
      description: "The vendor account did not accept the saved sign-in.",
      observedAt: attemptedAt
    });
    await applyAlertCondition({
      integration: updated,
      alertType: "integration.unavailable",
      severity: "warning",
      active: shouldOpenUnavailableAlert(failures, authentication),
      title: `${deviceName} could not be checked`,
      description: "Two scheduled checks could not reach the vendor service.",
      observedAt: attemptedAt
    });
    throw new Error(message);
  }
}

export async function listCurrentHomeEquipmentReadings(
  homeId: string
): Promise<HomeEquipmentReading[]> {
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare(
        `select reading.*
         from home_equipment_readings reading
         join (
           select integration_id, max(observed_at) as observed_at
           from home_equipment_readings
           where home_id = ?
           group by integration_id
         ) latest
           on latest.integration_id = reading.integration_id
          and latest.observed_at = reading.observed_at
         order by reading.provider asc`
      )
      .bind(homeId)
      .all<ReadingRow>();
    if (!result.success) throw new Error(result.error || "Equipment readings could not be read.");
    return (result.results || []).map(readingFromRow);
  }
  const store = await readLocalHomesStore();
  const latest = new Map<string, HomeEquipmentReading>();
  for (const reading of store.equipmentReadings || []) {
    if (reading.homeId !== homeId) continue;
    const current = latest.get(reading.integrationId);
    if (!current || current.observedAt < reading.observedAt) {
      latest.set(reading.integrationId, reading);
    }
  }
  return structuredClone([...latest.values()]);
}

export async function listHomeAlerts(
  homeId: string,
  includeResolved = false
): Promise<HomeAlert[]> {
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare(
        `select * from home_alerts where home_id = ?
         ${includeResolved ? "" : "and status in ('open', 'acknowledged')"}
         order by case severity when 'critical' then 0 else 1 end, opened_at desc`
      )
      .bind(homeId)
      .all<AlertRow>();
    if (!result.success) throw new Error(result.error || "Home alerts could not be read.");
    return (result.results || []).map(alertFromRow);
  }
  const store = await readLocalHomesStore();
  return structuredClone(
    (store.alerts || [])
      .filter((alert) => alert.homeId === homeId && (includeResolved || alert.status !== "resolved"))
      .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
  );
}

export async function listPortfolioHomeAlerts(): Promise<PortfolioHomeAlert[]> {
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare(
        `select alert.*, homes.public_name as home_name, homes.lh_code as home_code
         from home_alerts alert
         join homes on homes.id = alert.home_id
         where alert.status in ('open', 'acknowledged')
         order by case alert.severity when 'critical' then 0 else 1 end, alert.opened_at desc`
      )
      .all<AlertWithHomeRow>();
    if (!result.success) throw new Error(result.error || "Portfolio alerts could not be read.");
    return (result.results || []).map((row) => ({
      ...alertFromRow(row),
      homeName: row.home_name,
      homeCode: row.home_code
    }));
  }
  const store = await readLocalHomesStore();
  return (store.alerts || [])
    .filter((alert) => alert.status !== "resolved")
    .map((alert) => {
      const home = store.homes.find((item) => item.id === alert.homeId);
      return {
        ...structuredClone(alert),
        homeName: home?.publicName || "Unknown home",
        homeCode: home?.lhCode || "Home"
      };
    })
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt));
}

export async function acknowledgeHomeAlert(alertId: string, adminSessionId: string) {
  const now = new Date().toISOString();
  const d1 = await getHomesD1();
  if (d1) {
    const existing = await d1
      .prepare("select * from home_alerts where id = ?")
      .bind(alertId)
      .first<AlertRow>();
    if (!existing) throw new Error("Home alert not found.");
    if (existing.status === "resolved") return alertFromRow(existing);
    const result = await d1
      .prepare(
        `update home_alerts set status = 'acknowledged', acknowledged_at = ?,
         acknowledged_by_session_id = ?, updated_at = ? where id = ?`
      )
      .bind(now, adminSessionId, now, alertId)
      .run();
    assertD1Success(result, "The home alert could not be acknowledged.");
    return {
      ...alertFromRow(existing),
      status: "acknowledged" as const,
      acknowledgedAt: now,
      acknowledgedBySessionId: adminSessionId,
      updatedAt: now
    };
  }
  return mutateLocalHomesStore((store) => {
    const alert = (store.alerts || []).find((item) => item.id === alertId);
    if (!alert) throw new Error("Home alert not found.");
    if (alert.status !== "resolved") {
      alert.status = "acknowledged";
      alert.acknowledgedAt = now;
      alert.acknowledgedBySessionId = adminSessionId;
      alert.updatedAt = now;
    }
    return structuredClone(alert);
  });
}

async function listScheduledIntegrations() {
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare(
        `select * from home_integrations
         where external_device_id is not null
           and status in ('connected', 'error')
         order by home_id, provider`
      )
      .all<IntegrationRow>();
    if (!result.success) throw new Error(result.error || "Scheduled integrations could not be read.");
    return (result.results || []).map(integrationFromRow);
  }
  const store = await readLocalHomesStore();
  return (store.integrations || []).filter(
    (item) => item.externalDeviceId && (item.status === "connected" || item.status === "error")
  );
}

async function removeExpiredReadings() {
  const cutoff = new Date(Date.now() - READINGS_RETENTION_MS).toISOString();
  const d1 = await getHomesD1();
  if (d1) {
    const result = await d1
      .prepare("delete from home_equipment_readings where observed_at < ?")
      .bind(cutoff)
      .run();
    assertD1Success(result, "Old equipment readings could not be removed.");
    return;
  }
  await mutateLocalHomesStore((store) => {
    store.equipmentReadings = (store.equipmentReadings || []).filter(
      (item) => item.observedAt >= cutoff
    );
  });
}

export async function syncAllHomeIntegrations() {
  const integrations = await listScheduledIntegrations();
  const results = await Promise.allSettled(
    integrations.map((integration) =>
      syncHomeIntegration(integration.homeId, integration.id)
    )
  );
  await removeExpiredReadings();
  return {
    checked: results.length,
    succeeded: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length
  };
}
