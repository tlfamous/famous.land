"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  DiscoveredHomeDevice,
  HomeAlert,
  HomeEquipmentReading,
  HomeIntegration,
  HomeIntegrationProvider
} from "@/lib/property-ops";
import styles from "./homes.module.css";

type ApiResult<T = unknown> = {
  ok?: boolean;
  data?: T;
  error?: { message?: string };
};

type ConnectResult = {
  integration: HomeIntegration;
  devices: DiscoveredHomeDevice[];
};

export function EquipmentMonitoring({
  homeId,
  timezone,
  integrations,
  readings,
  alerts
}: {
  homeId: string;
  timezone: string;
  integrations: HomeIntegration[];
  readings: HomeEquipmentReading[];
  alerts: HomeAlert[];
}) {
  const router = useRouter();
  const configuredProviders = new Set(integrations.map((integration) => integration.provider));
  const firstAvailable: HomeIntegrationProvider = configuredProviders.has("mopeka")
    ? "econet"
    : "mopeka";
  const [provider, setProvider] = useState<HomeIntegrationProvider>(firstAvailable);
  const [showConnection, setShowConnection] = useState(integrations.length === 0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deviceChoices, setDeviceChoices] = useState<DiscoveredHomeDevice[]>([]);
  const [selectionIntegrationId, setSelectionIntegrationId] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const readingsByIntegration = useMemo(
    () => new Map(readings.map((reading) => [reading.integrationId, reading])),
    [readings]
  );

  async function request<T>(key: string, path: string, body: Record<string, unknown>) {
    setPending(key);
    setNotice("");
    setError("");
    try {
      const response = await fetch(path, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = (await response.json().catch(() => null)) as ApiResult<T> | null;
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error?.message || "The equipment request could not be completed.");
      }
      return result.data;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The equipment request could not be completed."
      );
      return undefined;
    } finally {
      setPending(null);
    }
  }

  async function connect(event: FormEvent) {
    event.preventDefault();
    const data = await request<ConnectResult>(
      `connect:${provider}`,
      `/api/homes/${encodeURIComponent(homeId)}/equipment/connect`,
      { provider, username, password }
    );
    if (!data) return;
    setUsername("");
    setPassword("");
    if (data.devices.length > 1 && !data.integration.externalDeviceId) {
      setDeviceChoices(data.devices);
      setSelectionIntegrationId(data.integration.id);
      setNotice("Choose the device that belongs to this home.");
      return;
    }
    setDeviceChoices([]);
    setSelectionIntegrationId("");
    setShowConnection(false);
    setNotice(`${providerLabel(provider)} monitoring connected and checked.`);
    router.refresh();
  }

  async function selectDevice(deviceId: string) {
    const data = await request(
      `select:${deviceId}`,
      `/api/homes/${encodeURIComponent(homeId)}/equipment/select`,
      { integrationId: selectionIntegrationId, externalDeviceId: deviceId }
    );
    if (!data) return;
    setDeviceChoices([]);
    setSelectionIntegrationId("");
    setShowConnection(false);
    setNotice("The selected device is connected and checked.");
    router.refresh();
  }

  async function refresh(integration: HomeIntegration) {
    const data = await request(
      `sync:${integration.id}`,
      `/api/homes/${encodeURIComponent(homeId)}/equipment/sync`,
      { integrationId: integration.id }
    );
    if (!data) return;
    setNotice(`${providerLabel(integration.provider)} status refreshed.`);
    router.refresh();
  }

  async function disconnect(integration: HomeIntegration) {
    if (!window.confirm(`Disconnect ${providerLabel(integration.provider)} monitoring from this home?`)) {
      return;
    }
    const data = await request(
      `disconnect:${integration.id}`,
      `/api/homes/${encodeURIComponent(homeId)}/equipment/disconnect`,
      { integrationId: integration.id }
    );
    if (!data) return;
    setNotice(`${providerLabel(integration.provider)} monitoring disconnected.`);
    router.refresh();
  }

  function reconnect(integration: HomeIntegration) {
    setProvider(integration.provider);
    setUsername("");
    setPassword("");
    setDeviceChoices([]);
    setSelectionIntegrationId("");
    setNotice("");
    setError("");
    setShowConnection(true);
  }

  return (
    <div className={styles.equipmentMonitoring}>
      <div className={styles.equipmentHeader}>
        <div>
          <p className={styles.operatorEyebrow}>Equipment monitoring</p>
          <h3>Current home status</h3>
          <p>Read-only cloud checks run once an hour. Vendor apps remain the source of truth.</p>
        </div>
        {configuredProviders.size < 2 ? (
          <button
            className={styles.secondaryLink}
            onClick={() => {
              setProvider(configuredProviders.has("mopeka") ? "econet" : "mopeka");
              setShowConnection((current) => !current);
            }}
            type="button"
          >
            {showConnection ? "Close setup" : "Connect equipment"}
          </button>
        ) : null}
      </div>

      {notice ? <p className={styles.successNotice} role="status">{notice}</p> : null}
      {error ? <p className={styles.errorNotice} role="alert">{error}</p> : null}

      {integrations.length ? (
        <div className={styles.equipmentGrid}>
          {integrations.map((integration) => (
            <EquipmentStatusCard
              alerts={alerts.filter((alert) => alert.integrationId === integration.id)}
              integration={integration}
              key={integration.id}
              onDisconnect={() => disconnect(integration)}
              onReconnect={() => reconnect(integration)}
              onRefresh={() => refresh(integration)}
              pending={pending}
              reading={readingsByIntegration.get(integration.id)}
              timezone={timezone}
            />
          ))}
        </div>
      ) : (
        <div className={styles.equipmentEmpty}>
          <strong>No equipment connected</strong>
          <span>Connect a Mopeka propane monitor or EcoNet water heater to begin hourly checks.</span>
        </div>
      )}

      {showConnection ? (
        <form className={styles.equipmentConnectForm} onSubmit={connect}>
          <div>
            <p className={styles.operatorEyebrow}>Private connection</p>
            <h3>
              {configuredProviders.has(provider) ? `Reconnect ${providerLabel(provider)}` : `Connect ${providerLabel(provider)}`}
            </h3>
            <p>The app password is encrypted immediately and is never displayed again.</p>
          </div>
          <label>
            Provider
            <select
              disabled={pending !== null}
              onChange={(event) => setProvider(event.target.value as HomeIntegrationProvider)}
              value={provider}
            >
              <option disabled={configuredProviders.has("mopeka") && provider !== "mopeka"} value="mopeka">
                Mopeka Tank Check
              </option>
              <option disabled={configuredProviders.has("econet") && provider !== "econet"} value="econet">
                Rheem EcoNet
              </option>
            </select>
          </label>
          <label>
            App email
            <input
              autoComplete="username"
              disabled={pending !== null}
              onChange={(event) => setUsername(event.target.value)}
              required
              type="email"
              value={username}
            />
          </label>
          <label>
            App password
            <input
              autoComplete="current-password"
              disabled={pending !== null}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button className={styles.primaryLink} disabled={pending !== null} type="submit">
            {pending === `connect:${provider}` ? "Connecting…" : "Connect and check"}
          </button>
        </form>
      ) : null}

      {deviceChoices.length ? (
        <div className={styles.deviceChooser}>
          <div>
            <p className={styles.operatorEyebrow}>Choose this home’s device</p>
            <h3>More than one device was found</h3>
          </div>
          {deviceChoices.map((device) => (
            <button
              className={styles.deviceChoice}
              disabled={pending !== null}
              key={device.id}
              onClick={() => selectDevice(device.id)}
              type="button"
            >
              <strong>{device.name}</strong>
              <span>{device.locationName || device.id}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EquipmentStatusCard({
  integration,
  reading,
  alerts,
  timezone,
  pending,
  onRefresh,
  onReconnect,
  onDisconnect
}: {
  integration: HomeIntegration;
  reading?: HomeEquipmentReading;
  alerts: HomeAlert[];
  timezone: string;
  pending: string | null;
  onRefresh: () => void;
  onReconnect: () => void;
  onDisconnect: () => void;
}) {
  const status = equipmentStatus(integration, reading, alerts);
  const metrics =
    integration.provider === "mopeka"
      ? mopekaMetrics(reading)
      : econetMetrics(reading);

  return (
    <article className={styles.equipmentCard}>
      <header>
        <div>
          <span className={styles.equipmentProvider}>{providerLabel(integration.provider)}</span>
          <h4>{integration.externalDeviceName || providerEquipmentLabel(integration.provider)}</h4>
          <p>{integration.externalLocationName || integration.accountHint || "Connected account"}</p>
        </div>
        <span className={`${styles.equipmentState} ${styles[`equipmentState_${status.tone}`]}`}>
          {status.label}
        </span>
      </header>

      <div className={styles.equipmentPrimaryMetric}>
        <strong>{primaryMetric(integration.provider, reading)}</strong>
        <span>{integration.provider === "mopeka" ? "Propane remaining" : "Water-heater status"}</span>
      </div>

      <dl className={styles.equipmentFacts}>
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>

      {alerts.length ? (
        <div className={styles.equipmentAlertSummary}>
          <strong>{alerts[0].title}</strong>
          <span>{alerts[0].description}</span>
        </div>
      ) : null}

      {integration.lastError ? (
        <p className={styles.equipmentError}>{integration.lastError}</p>
      ) : null}

      <footer>
        <span>
          {integration.lastSuccessAt
            ? `Checked ${formatDateTime(integration.lastSuccessAt, timezone)}`
            : "Waiting for first successful check"}
        </span>
        <div>
          <button
            className={styles.secondaryLink}
            disabled={pending !== null || !integration.externalDeviceId}
            onClick={onRefresh}
            type="button"
          >
            {pending === `sync:${integration.id}` ? "Refreshing…" : "Refresh now"}
          </button>
          <button className={styles.textButton} disabled={pending !== null} onClick={onReconnect} type="button">
            Reconnect
          </button>
          <button className={styles.textDanger} disabled={pending !== null} onClick={onDisconnect} type="button">
            Disconnect
          </button>
        </div>
      </footer>
    </article>
  );
}

function providerLabel(provider: HomeIntegrationProvider) {
  return provider === "mopeka" ? "Mopeka Tank Check" : "Rheem EcoNet";
}

function providerEquipmentLabel(provider: HomeIntegrationProvider) {
  return provider === "mopeka" ? "Propane monitor" : "Water heater";
}

function equipmentStatus(
  integration: HomeIntegration,
  reading: HomeEquipmentReading | undefined,
  alerts: HomeAlert[]
) {
  if (alerts.some((alert) => alert.severity === "critical")) {
    return { label: "Needs attention", tone: "critical" };
  }
  if (alerts.length || integration.status !== "connected") {
    return { label: "Check", tone: "warning" };
  }
  if (!reading) return { label: "Waiting", tone: "muted" };
  return { label: "All clear", tone: "clear" };
}

function metric(reading: HomeEquipmentReading | undefined, key: string) {
  return reading?.metrics[key];
}

function numeric(reading: HomeEquipmentReading | undefined, key: string) {
  const value = metric(reading, key);
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function primaryMetric(
  provider: HomeIntegrationProvider,
  reading: HomeEquipmentReading | undefined
) {
  if (!reading) return "—";
  if (provider === "mopeka") {
    const fill = numeric(reading, "fillPercent");
    return fill === undefined ? "—" : `${Math.round(fill)}%`;
  }
  return reading.online ? "Online" : "Offline";
}

function mopekaMetrics(reading: HomeEquipmentReading | undefined) {
  const gallons = numeric(reading, "estimatedGallons");
  const battery = numeric(reading, "batteryVoltage");
  const signal = numeric(reading, "signalQuality");
  const temperature = numeric(reading, "temperatureF");
  return [
    { label: "Estimated fuel", value: gallons === undefined ? "Unknown" : `${gallons.toFixed(1)} gal` },
    { label: "Sensor battery", value: battery === undefined ? "Unknown" : `${battery.toFixed(2)} V` },
    { label: "Signal", value: signal === undefined ? "Unknown" : `${Math.round(signal)}` },
    { label: "Tank temperature", value: temperature === undefined ? "Unknown" : `${Math.round(temperature)}°F` },
    { label: "Source update", value: reading?.sourceUpdatedAt ? formatShort(reading.sourceUpdatedAt) : "Unknown" }
  ];
}

function econetMetrics(reading: HomeEquipmentReading | undefined) {
  const setPoint = numeric(reading, "setPointF");
  const hotWater = numeric(reading, "hotWaterPercent");
  const tankHealth = numeric(reading, "tankHealth");
  const combustionHealth = numeric(reading, "combustionHealth");
  const alertCount = numeric(reading, "alertCount");
  return [
    { label: "Mode", value: String(metric(reading, "mode") || "Unknown") },
    { label: "Set temperature", value: setPoint === undefined ? "Unknown" : `${Math.round(setPoint)}°F` },
    { label: "Hot water", value: hotWater === undefined ? "Unknown" : `${Math.round(hotWater)}%` },
    { label: "Tank health", value: tankHealth === undefined ? "Unknown" : `${Math.round(tankHealth)}%` },
    { label: "Combustion health", value: combustionHealth === undefined ? "Not reported" : `${Math.round(combustionHealth)}%` },
    { label: "Active alerts", value: alertCount === undefined ? "Unknown" : `${Math.round(alertCount)}` }
  ];
}

function formatShort(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York"
  }).format(parsed);
}

function formatDateTime(value: string, timezone: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone
  }).format(parsed);
}
