import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  isEmailDeliveryConfigured,
  sendProgressSavedEmail,
  sendRecoveryEmail
} from "@/lib/email";
import { markers, zones } from "@/lib/markers";
import type { ScanRecord } from "@/lib/types";

type SavedPlayer = {
  player_id: string;
  email: string;
  saved_at: string;
  recovery_code: string;
};

type RecoveryRequest = {
  email: string;
  requested_at: string;
  mode: string;
};

type PlayerContact = {
  player_id: string;
  email?: string;
  phone_number?: string;
  email_updated_at?: string;
  phone_updated_at?: string;
  created_at: string;
  updated_at: string;
};

type PlayerContactUpdate = {
  player_id: string;
  email?: string;
  phone_number?: string;
  email_updated_at?: string;
  phone_updated_at?: string;
};

export type MessageEventRow = {
  id: string;
  player_id?: string;
  recipient: string;
  channel: "email" | "sms";
  message_type: string;
  provider?: string;
  provider_message_id?: string;
  status: string;
  error?: string;
  created_at: string;
};

export type AdminAuditEventRow = {
  id: string;
  action: string;
  player_id?: string;
  target?: string;
  result: string;
  detail?: string;
  created_at: string;
};

type GameSettingRecord = {
  name: string;
  value: string;
  updated_at: string;
};

export type GameAvailability = {
  enabled: boolean;
  updated_at?: string;
};

type DbShape = {
  scans: ScanRecord[];
  scan_events: ScanEventRecord[];
  saved_players: SavedPlayer[];
  player_contacts: PlayerContact[];
  recovery_requests: RecoveryRequest[];
  message_events: MessageEventRow[];
  admin_audit_events: AdminAuditEventRow[];
  game_settings: GameSettingRecord[];
};

type ScanEventRecord = ScanRecord & {
  id: string;
  is_test: boolean;
  email_id?: string;
  progress_eligible: boolean;
};

type D1ScanEventRow = Omit<
  ScanEventRecord,
  "user_agent" | "is_test" | "email_id" | "progress_eligible"
> & {
  user_agent?: string | null;
  is_test?: boolean | number | string | null;
  email_id?: string | null;
  progress_eligible?: boolean | number | string | null;
};

type ScanReportLogRow = {
  id: string;
  scanned_at: string;
  email_id?: string;
  player_id: string;
  marker_id: string;
  short_code: string;
  location: string;
  zone: string;
  is_test: boolean;
};

type ScanTimelineBucket = {
  label: string;
  start_date: string;
  end_date: string;
  count: number;
};

export type ScanTimelineUnit = "day" | "week" | "month";

export type ScanReportFilterInput = {
  start_date?: string;
  end_date?: string;
  unit?: string;
  zone?: string;
  player_id?: string;
  include_tests?: boolean;
};

export type ScanReportFilters = {
  start_date: string;
  end_date: string;
  unit: ScanTimelineUnit;
  zone: string;
  player_id: string;
  include_tests: boolean;
};

type PlayerScanRow = {
  player_id: string;
  scan_count: number;
  last_scan_at?: string;
};

type D1PlayerScanRow = {
  player_id: string;
  scan_count: number | string;
  last_scan_at?: string | null;
};

type SavedPlayerEmailRow = {
  player_id: string;
  email: string;
  saved_at: string;
};

type D1PlayerContactRow = {
  player_id: string;
  email?: string | null;
  phone_number?: string | null;
  email_updated_at?: string | null;
  phone_updated_at?: string | null;
  created_at: string;
  updated_at: string;
};

type D1MessageEventRow = {
  id: string;
  player_id?: string | null;
  recipient: string;
  channel: "email" | "sms";
  message_type: string;
  provider?: string | null;
  provider_message_id?: string | null;
  status: string;
  error?: string | null;
  created_at: string;
};

type D1AdminAuditEventRow = {
  id: string;
  action: string;
  player_id?: string | null;
  target?: string | null;
  result: string;
  detail?: string | null;
  created_at: string;
};

export type ScanReport = {
  total_scans: number;
  unique_phones: number;
  identified_players: number;
  unique_markers: number;
  test_scans: number;
  latest_scan_at?: string;
  timeline_label: string;
  timeline: ScanTimelineBucket[];
  zone_counts: { zone: string; count: number }[];
  filters: ScanReportFilters;
  zone_options: string[];
  player_options: string[];
  log: ScanReportLogRow[];
};

export type PlayerReportRow = {
  player_id: string;
  scan_count: number;
  last_scan_at?: string;
  email?: string;
  phone_number?: string;
};

export type PlayerReport = {
  total_players: number;
  players_with_email: number;
  players_with_phone: number;
  players: PlayerReportRow[];
};

export type MessageAdminReport = PlayerReport & {
  message_events: MessageEventRow[];
  audit_events: AdminAuditEventRow[];
};

type D1RunResult = {
  success: boolean;
  error?: string;
  meta?: {
    changes?: number;
  };
};

type D1QueryResult<T> = {
  results?: T[];
  success: boolean;
  error?: string;
};

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1QueryResult<T>>;
  run(): Promise<D1RunResult>;
};

type FamousLandD1 = {
  prepare(query: string): D1Statement;
};

type LocalFs = typeof import("node:fs/promises");
type LocalPath = typeof import("node:path");

const emptyDb: DbShape = {
  scans: [],
  scan_events: [],
  saved_players: [],
  player_contacts: [],
  recovery_requests: [],
  message_events: [],
  admin_audit_events: [],
  game_settings: []
};

const EASTERN_TIME_ZONE = "America/New_York";
const GAME_ENABLED_SETTING_NAME = "game_enabled";
const GAME_OFF_SCAN_PLAYER_ID = "GAME-OFF";
const REPORT_START_MONTH_INDEX = 4;
const REPORT_MONTHS = 6;
const REPORT_DAY_MS = 24 * 60 * 60 * 1000;
const REPORT_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TIMELINE_UNITS = new Set<ScanTimelineUnit>(["day", "week", "month"]);

const easternDatePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: EASTERN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric"
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  year: "numeric"
});

let localModules:
  | {
      fs: LocalFs;
      path: LocalPath;
    }
  | undefined;

async function getD1(): Promise<FamousLandD1 | undefined> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as CloudflareEnv & {
      DB?: FamousLandD1;
      famous_land_quest?: FamousLandD1;
    };

    return env.DB ?? env.famous_land_quest;
  } catch {
    return undefined;
  }
}

async function getLocalModules() {
  if (!localModules) {
    const [fs, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
    localModules = { fs, path };
  }

  return localModules;
}

async function dbPath(): Promise<string> {
  if (process.env.FAMOUS_LAND_DB_PATH) {
    return process.env.FAMOUS_LAND_DB_PATH;
  }

  if (process.env.VERCEL) {
    return "/tmp/famous-land-db.json";
  }

  const { path } = await getLocalModules();
  return path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    ".data",
    "famous-land-db.json"
  );
}

async function readLocalDb(): Promise<DbShape> {
  const { fs } = await getLocalModules();
  const file = await dbPath();

  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    const scans = parsed.scans ?? [];

    return {
      ...emptyDb,
      ...parsed,
      scans,
      scan_events: (parsed.scan_events ?? scans.map(scanToLegacyEvent)).map(normalizeLocalScanEvent),
      player_contacts: parsed.player_contacts ?? contactsFromSavedPlayers(parsed.saved_players ?? []),
      message_events: parsed.message_events ?? [],
      admin_audit_events: parsed.admin_audit_events ?? [],
      game_settings: parsed.game_settings ?? []
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyDb;
    }

    throw error;
  }
}

async function writeLocalDb(db: DbShape) {
  const { fs, path } = await getLocalModules();
  const file = await dbPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8");
}

export async function getGameAvailability(): Promise<GameAvailability> {
  const d1 = await getD1();

  if (d1) {
    try {
      await ensureD1GameSettings(d1);
      const row = await d1
        .prepare("select value, updated_at from game_settings where name = ?")
        .bind(GAME_ENABLED_SETTING_NAME)
        .first<{ value?: string | null; updated_at?: string | null }>();

      return gameAvailabilityFromSetting(row?.value, row?.updated_at);
    } catch (error) {
      console.error("Famous Land game setting query failed", error);
      return { enabled: true };
    }
  }

  const db = await readLocalDb();
  const setting = db.game_settings.find((row) => row.name === GAME_ENABLED_SETTING_NAME);
  return gameAvailabilityFromSetting(setting?.value, setting?.updated_at);
}

export async function setGameAvailability(enabled: boolean): Promise<GameAvailability> {
  const value = enabled ? "on" : "off";
  const updated_at = new Date().toISOString();
  const d1 = await getD1();

  if (d1) {
    await ensureD1GameSettings(d1);
    const result = await d1
      .prepare(
        `insert into game_settings (name, value, updated_at)
         values (?, ?, ?)
         on conflict(name) do update set
           value = excluded.value,
           updated_at = excluded.updated_at`
      )
      .bind(GAME_ENABLED_SETTING_NAME, value, updated_at)
      .run();

    if (!result.success) {
      throw new Error(result.error ?? "game_settings update failed");
    }

    await recordAdminAuditEvent({
      action: "game.availability.update",
      target: GAME_ENABLED_SETTING_NAME,
      result: value,
      detail: enabled ? "Admin turned the game on." : "Admin turned the game off."
    });

    return { enabled, updated_at };
  }

  const db = await readLocalDb();
  db.game_settings = [
    ...db.game_settings.filter((setting) => setting.name !== GAME_ENABLED_SETTING_NAME),
    { name: GAME_ENABLED_SETTING_NAME, value, updated_at }
  ];
  db.admin_audit_events.push(
    makeAdminAuditEvent({
      action: "game.availability.update",
      target: GAME_ENABLED_SETTING_NAME,
      result: value,
      detail: enabled ? "Admin turned the game on." : "Admin turned the game off."
    })
  );
  await writeLocalDb(db);

  return { enabled, updated_at };
}

async function ensureD1GameSettings(d1: FamousLandD1) {
  const result = await d1
    .prepare(
      `create table if not exists game_settings (
         name text primary key,
         value text not null,
         updated_at text not null
       )`
    )
    .run();

  if (!result.success) {
    throw new Error(result.error ?? "game_settings schema check failed");
  }
}

function gameAvailabilityFromSetting(
  value?: string | null,
  updated_at?: string | null
): GameAvailability {
  return {
    enabled: value !== "off",
    updated_at: updated_at ?? undefined
  };
}

async function getScanEvents(): Promise<ScanEventRecord[]> {
  const d1 = await getD1();

  if (d1) {
    return getD1ScanEvents(d1);
  }

  const db = await readLocalDb();
  return [...db.scan_events].sort((a, b) => b.scanned_at.localeCompare(a.scanned_at));
}

export async function recordScan(input: {
  player_id: string;
  marker_id: string;
  user_agent?: string;
  is_test?: boolean;
  track_event?: boolean;
}): Promise<{ is_new: boolean; scan: ScanRecord }> {
  const d1 = await getD1();

  if (d1) {
    return recordD1Scan(d1, input);
  }

  const db = await readLocalDb();
  const scannedAt = new Date().toISOString();
  const scan: ScanRecord = {
    player_id: input.player_id,
    marker_id: input.marker_id,
    scanned_at: scannedAt,
    user_agent: input.user_agent,
    is_test: input.is_test === true
  };

  if (input.track_event !== false) {
    db.scan_events.push(makeScanEvent(scan, { progress_eligible: true }));
  }

  const existing = db.scans.find(
    (scan) => scan.player_id === input.player_id && scan.marker_id === input.marker_id
  );

  if (existing) {
    if (input.track_event !== false) {
      await writeLocalDb(db);
    }
    return { is_new: false, scan: existing };
  }

  db.scans.push(scan);
  await writeLocalDb(db);
  return { is_new: true, scan };
}

export async function recordGameOffScan(input: {
  source_player_id?: string;
  marker_id: string;
  user_agent?: string;
  is_test?: boolean;
}): Promise<ScanEventRecord> {
  const email_id = await getPlayerIdentityLabel(input.source_player_id);
  const event = makeScanEvent(
    {
      player_id: GAME_OFF_SCAN_PLAYER_ID,
      marker_id: input.marker_id,
      scanned_at: new Date().toISOString(),
      user_agent: input.user_agent,
      is_test: input.is_test === true
    },
    {
      email_id,
      progress_eligible: false
    }
  );
  const d1 = await getD1();

  if (d1) {
    await recordD1ScanEvent(d1, event);
    return event;
  }

  const db = await readLocalDb();
  db.scan_events.push(event);
  await writeLocalDb(db);
  return event;
}

export async function backfillScans(input: {
  player_id: string;
  marker_ids: string[];
  user_agent?: string;
}) {
  const validMarkerIds = new Set(markers.map((marker) => marker.marker_id));

  for (const markerId of input.marker_ids) {
    if (validMarkerIds.has(markerId)) {
      await recordScan({
        player_id: input.player_id,
        marker_id: markerId,
        user_agent: input.user_agent,
        track_event: false
      });
    }
  }
}

export async function getScanReport(inputFilters: ScanReportFilterInput = {}): Promise<ScanReport> {
  const filters = resolveScanReportFilters(inputFilters);
  const [events, playerIdentityById] = await Promise.all([
    getScanEvents(),
    getPlayerIdentityMap()
  ]);
  const markerById = new Map(markers.map((marker) => [marker.marker_id, marker]));
  const filteredEvents = filterScanEvents(events, filters, markerById);
  const sortedEvents = [...filteredEvents].sort((a, b) => b.scanned_at.localeCompare(a.scanned_at));
  const zoneCounts = new Map<string, number>();
  const filteredPlayerIds = new Set(filteredEvents.map((event) => event.player_id));

  for (const event of filteredEvents) {
    const marker = markerById.get(event.marker_id);
    const zone = marker?.zone ?? "Unknown";
    zoneCounts.set(zone, (zoneCounts.get(zone) ?? 0) + 1);
  }

  return {
    total_scans: filteredEvents.length,
    unique_phones: filteredPlayerIds.size,
    identified_players: Array.from(filteredPlayerIds).filter((playerId) =>
      playerIdentityById.has(playerId)
    ).length,
    unique_markers: new Set(filteredEvents.map((event) => event.marker_id)).size,
    test_scans: filteredEvents.filter((event) => event.is_test).length,
    latest_scan_at: sortedEvents[0]?.scanned_at,
    timeline_label: timelineLabel(filters),
    timeline: buildTimeline(filteredEvents, filters),
    zone_counts: Array.from(zoneCounts, ([zone, count]) => ({ zone, count })).sort(
      (a, b) => b.count - a.count || a.zone.localeCompare(b.zone)
    ),
    filters,
    zone_options: zoneOptions(events, markerById),
    player_options: playerOptions(events),
    log: sortedEvents.slice(0, 200).map((event) => {
      const marker = markerById.get(event.marker_id);

      return {
        id: event.id,
        scanned_at: event.scanned_at,
        email_id: event.email_id ?? playerIdentityById.get(event.player_id),
        player_id: event.player_id,
        marker_id: event.marker_id,
        short_code: marker?.short_code ?? event.marker_id,
        location: marker?.marker_name ?? event.marker_id,
        zone: marker?.zone ?? "Unknown",
        is_test: event.is_test
      };
    })
  };
}

function resolveScanReportFilters(input: ScanReportFilterInput): ScanReportFilters {
  const defaults = defaultTimelineDateRange();
  const startDate = validIsoDate(input.start_date) ?? defaults.start_date;
  const rawEndDate = validIsoDate(input.end_date) ?? defaults.end_date;
  const startMs = dateInputMs(startDate);
  const rawEndMs = dateInputMs(rawEndDate);
  const endDate = rawEndMs < startMs ? startDate : rawEndDate;
  const unit = TIMELINE_UNITS.has(input.unit as ScanTimelineUnit)
    ? (input.unit as ScanTimelineUnit)
    : "week";

  return {
    start_date: startDate,
    end_date: endDate,
    unit,
    zone: input.zone?.trim() ?? "",
    player_id: input.player_id?.trim() ?? "",
    include_tests: input.include_tests === true
  };
}

function filterScanEvents(
  events: ScanEventRecord[],
  filters: ScanReportFilters,
  markerById: Map<string, (typeof markers)[number]>
) {
  const startMs = dateInputMs(filters.start_date);
  const endMs = dateInputMs(filters.end_date) + REPORT_DAY_MS;

  return events.filter((event) => {
    const eventDayMs = easternDayMs(event.scanned_at);
    const marker = markerById.get(event.marker_id);

    if (eventDayMs === undefined || eventDayMs < startMs || eventDayMs >= endMs) {
      return false;
    }

    if (!filters.include_tests && event.is_test) {
      return false;
    }

    if (filters.zone && (marker?.zone ?? "Unknown") !== filters.zone) {
      return false;
    }

    if (filters.player_id && event.player_id !== filters.player_id) {
      return false;
    }

    return true;
  });
}

function zoneOptions(events: ScanEventRecord[], markerById: Map<string, (typeof markers)[number]>) {
  const options = new Set<string>(zones);

  for (const event of events) {
    options.add(markerById.get(event.marker_id)?.zone ?? "Unknown");
  }

  return Array.from(options);
}

function playerOptions(events: ScanEventRecord[]) {
  return Array.from(new Set(events.map((event) => event.player_id))).sort();
}

export async function getPlayerReport(): Promise<PlayerReport> {
  const d1 = await getD1();
  const players = d1 ? await getD1PlayerRows(d1) : await getLocalPlayerRows();

  return {
    total_players: players.length,
    players_with_email: players.filter((player) => player.email).length,
    players_with_phone: players.filter((player) => player.phone_number).length,
    players
  };
}

export async function getMessageAdminReport(): Promise<MessageAdminReport> {
  const [playerReport, messageEvents, auditEvents] = await Promise.all([
    getPlayerReport(),
    getMessageEvents(200),
    getAdminAuditEvents(200)
  ]);

  return {
    ...playerReport,
    message_events: messageEvents,
    audit_events: auditEvents
  };
}

export async function updatePlayerContact(input: {
  player_id: string;
  email?: string;
  phone_number?: string;
}): Promise<PlayerReportRow | undefined> {
  const player_id = input.player_id.trim();
  const email = input.email?.trim().toLowerCase();
  const phone_number = input.phone_number?.trim();

  if (!player_id) {
    return undefined;
  }

  const d1 = await getD1();
  const now = new Date().toISOString();

  if (d1) {
    await upsertD1PlayerContact(d1, {
      player_id,
      email: email || undefined,
      phone_number: phone_number || undefined,
      email_updated_at: email ? now : undefined,
      phone_updated_at: phone_number ? now : undefined
    });
    await recordAdminAuditEvent({
      action: "contact.update",
      player_id,
      target: email || phone_number || player_id,
      result: "updated",
      detail: "Admin updated player contact details."
    });
  } else {
    const db = await readLocalDb();
    upsertLocalPlayerContact(db, {
      player_id,
      email: email || undefined,
      phone_number: phone_number || undefined,
      email_updated_at: email ? now : undefined,
      phone_updated_at: phone_number ? now : undefined
    });
    db.admin_audit_events.push(
      makeAdminAuditEvent({
        action: "contact.update",
        player_id,
        target: email || phone_number || player_id,
        result: "updated",
        detail: "Admin updated player contact details."
      })
    );
    await writeLocalDb(db);
  }

  return (await getPlayerReport()).players.find((player) => player.player_id === player_id);
}

async function getPlayerIdentityMap(): Promise<Map<string, string>> {
  const d1 = await getD1();

  if (d1) {
    const [savedRows, contactRows] = await Promise.all([
      getD1SavedPlayerRows(d1),
      getD1PlayerContactRows(d1)
    ]);

    return playerIdentityMapFromRows({ savedRows, contactRows });
  }

  const db = await readLocalDb();
  return playerIdentityMapFromRows({
    savedRows: db.saved_players,
    contactRows: db.player_contacts
  });
}

async function getPlayerIdentityLabel(playerId?: string): Promise<string | undefined> {
  const normalizedPlayerId = playerId?.trim();

  if (!normalizedPlayerId) {
    return undefined;
  }

  return (await getPlayerIdentityMap()).get(normalizedPlayerId);
}

export async function savePlayerPhoneNumber(input: {
  player_id: string;
  phone_number: string;
}) {
  const player_id = input.player_id.trim();
  const phone_number = input.phone_number.trim();

  if (!player_id || !phone_number) {
    return;
  }

  const d1 = await getD1();
  const phone_updated_at = new Date().toISOString();

  if (d1) {
    await upsertD1PlayerContact(d1, {
      player_id,
      phone_number,
      phone_updated_at
    });
    return;
  }

  const db = await readLocalDb();
  upsertLocalPlayerContact(db, {
    player_id,
    phone_number,
    phone_updated_at
  });
  await writeLocalDb(db);
}

async function getMessageEvents(limit = 200): Promise<MessageEventRow[]> {
  const d1 = await getD1();

  if (d1) {
    try {
      const result = await d1
        .prepare(
          `select id, player_id, recipient, channel, message_type, provider, provider_message_id, status, error, created_at
           from message_events
           order by created_at desc
           limit ?`
        )
        .bind(limit)
        .all<D1MessageEventRow>();

      if (!result.success) {
        throw new Error(result.error ?? "message_events query failed");
      }

      return (result.results ?? []).map(normalizeD1MessageEvent);
    } catch (error) {
      console.error("Famous Land message event query failed", error);
      return [];
    }
  }

  const db = await readLocalDb();
  return [...db.message_events]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

async function getAdminAuditEvents(limit = 200): Promise<AdminAuditEventRow[]> {
  const d1 = await getD1();

  if (d1) {
    try {
      const result = await d1
        .prepare(
          `select id, action, player_id, target, result, detail, created_at
           from admin_audit_events
           order by created_at desc
           limit ?`
        )
        .bind(limit)
        .all<D1AdminAuditEventRow>();

      if (!result.success) {
        throw new Error(result.error ?? "admin_audit_events query failed");
      }

      return (result.results ?? []).map(normalizeD1AdminAuditEvent);
    } catch (error) {
      console.error("Famous Land admin audit query failed", error);
      return [];
    }
  }

  const db = await readLocalDb();
  return [...db.admin_audit_events]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

async function recordMessageEvent(
  input: Omit<MessageEventRow, "id" | "created_at">
): Promise<void> {
  const event = makeMessageEvent(input);
  const d1 = await getD1();

  if (d1) {
    try {
      const result = await d1
        .prepare(
          `insert into message_events (
             id,
             player_id,
             recipient,
             channel,
             message_type,
             provider,
             provider_message_id,
             status,
             error,
             created_at
           )
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          event.id,
          event.player_id ?? null,
          event.recipient,
          event.channel,
          event.message_type,
          event.provider ?? null,
          event.provider_message_id ?? null,
          event.status,
          event.error ?? null,
          event.created_at
        )
        .run();

      if (!result.success) {
        throw new Error(result.error ?? "message event insert failed");
      }
    } catch (error) {
      console.error("Famous Land message event insert failed", error);
    }
    return;
  }

  const db = await readLocalDb();
  db.message_events.push(event);
  await writeLocalDb(db);
}

async function recordAdminAuditEvent(
  input: Omit<AdminAuditEventRow, "id" | "created_at">
): Promise<void> {
  const event = makeAdminAuditEvent(input);
  const d1 = await getD1();

  if (d1) {
    try {
      const result = await d1
        .prepare(
          `insert into admin_audit_events (
             id,
             action,
             player_id,
             target,
             result,
             detail,
             created_at
           )
           values (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          event.id,
          event.action,
          event.player_id ?? null,
          event.target ?? null,
          event.result,
          event.detail ?? null,
          event.created_at
        )
        .run();

      if (!result.success) {
        throw new Error(result.error ?? "admin audit event insert failed");
      }
    } catch (error) {
      if (!isMissingTableError(error)) {
        console.error("Famous Land admin audit insert failed", error);
      }
    }
    return;
  }

  const db = await readLocalDb();
  db.admin_audit_events.push(event);
  await writeLocalDb(db);
}

function makeMessageEvent(input: Omit<MessageEventRow, "id" | "created_at">): MessageEventRow {
  return {
    id: crypto.randomUUID(),
    ...input,
    created_at: new Date().toISOString()
  };
}

function makeAdminAuditEvent(
  input: Omit<AdminAuditEventRow, "id" | "created_at">
): AdminAuditEventRow {
  return {
    id: crypto.randomUUID(),
    ...input,
    created_at: new Date().toISOString()
  };
}

function normalizeD1MessageEvent(event: D1MessageEventRow): MessageEventRow {
  return {
    id: event.id,
    player_id: event.player_id ?? undefined,
    recipient: event.recipient,
    channel: event.channel,
    message_type: event.message_type,
    provider: event.provider ?? undefined,
    provider_message_id: event.provider_message_id ?? undefined,
    status: event.status,
    error: event.error ?? undefined,
    created_at: event.created_at
  };
}

function normalizeD1AdminAuditEvent(event: D1AdminAuditEventRow): AdminAuditEventRow {
  return {
    id: event.id,
    action: event.action,
    player_id: event.player_id ?? undefined,
    target: event.target ?? undefined,
    result: event.result,
    detail: event.detail ?? undefined,
    created_at: event.created_at
  };
}

async function getLocalPlayerRows(): Promise<PlayerReportRow[]> {
  const db = await readLocalDb();
  const events = db.scan_events.length ? db.scan_events : db.scans.map(scanToLegacyEvent);

  return buildPlayerRows({
    scanRows: summarizePlayerScans(events),
    savedRows: db.saved_players,
    contactRows: db.player_contacts
  });
}

async function getD1PlayerRows(d1: FamousLandD1): Promise<PlayerReportRow[]> {
  const [scanRows, savedRows, contactRows] = await Promise.all([
    getD1PlayerScanRows(d1),
    getD1SavedPlayerRows(d1),
    getD1PlayerContactRows(d1)
  ]);

  return buildPlayerRows({ scanRows, savedRows, contactRows });
}

async function getD1PlayerScanRows(d1: FamousLandD1): Promise<PlayerScanRow[]> {
  try {
    const result = await d1
      .prepare(
        `select player_id, count(*) as scan_count, max(scanned_at) as last_scan_at
         from scan_events
         where coalesce(progress_eligible, 1) = 1
         group by player_id`
      )
      .all<D1PlayerScanRow>();

    if (!result.success) {
      throw new Error(result.error ?? "scan_events player query failed");
    }

    return normalizePlayerScanRows(result.results ?? []);
  } catch {
    const fallback = await d1
      .prepare(
        `select player_id, count(*) as scan_count, max(scanned_at) as last_scan_at
         from marker_scans
         group by player_id`
      )
      .all<D1PlayerScanRow>();

    return normalizePlayerScanRows(fallback.results ?? []);
  }
}

async function getD1SavedPlayerRows(d1: FamousLandD1): Promise<SavedPlayerEmailRow[]> {
  try {
    const result = await d1
      .prepare(
        `select player_id, email, saved_at
         from saved_players
         order by saved_at desc`
      )
      .all<SavedPlayerEmailRow>();

    if (!result.success) {
      throw new Error(result.error ?? "saved_players query failed");
    }

    return result.results ?? [];
  } catch (error) {
    if (!isMissingTableError(error)) {
      console.error("Famous Land saved player query failed", error);
    }
    return [];
  }
}

async function getD1PlayerContactRows(d1: FamousLandD1): Promise<PlayerContact[]> {
  try {
    const result = await d1
      .prepare(
        `select player_id, email, phone_number, email_updated_at, phone_updated_at, created_at, updated_at
         from player_contacts`
      )
      .all<D1PlayerContactRow>();

    if (!result.success) {
      throw new Error(result.error ?? "player_contacts query failed");
    }

    return (result.results ?? []).map(normalizePlayerContactRow);
  } catch {
    return [];
  }
}

function summarizePlayerScans(events: ScanEventRecord[]): PlayerScanRow[] {
  const byPlayer = new Map<string, PlayerScanRow>();

  for (const event of events) {
    if (!event.progress_eligible) {
      continue;
    }

    const current = byPlayer.get(event.player_id);

    if (!current) {
      byPlayer.set(event.player_id, {
        player_id: event.player_id,
        scan_count: 1,
        last_scan_at: event.scanned_at
      });
      continue;
    }

    current.scan_count += 1;
    if (!current.last_scan_at || event.scanned_at > current.last_scan_at) {
      current.last_scan_at = event.scanned_at;
    }
  }

  return Array.from(byPlayer.values());
}

function buildPlayerRows(input: {
  scanRows: PlayerScanRow[];
  savedRows: SavedPlayerEmailRow[];
  contactRows: PlayerContact[];
}): PlayerReportRow[] {
  const playerIds = new Set<string>();
  const scansByPlayer = new Map(input.scanRows.map((row) => [row.player_id, row]));
  const savedByPlayer = new Map<string, SavedPlayerEmailRow>();
  const contactsByPlayer = new Map(input.contactRows.map((row) => [row.player_id, row]));

  for (const row of input.scanRows) {
    playerIds.add(row.player_id);
  }

  for (const row of input.savedRows) {
    playerIds.add(row.player_id);
    if (!savedByPlayer.has(row.player_id)) {
      savedByPlayer.set(row.player_id, row);
    }
  }

  for (const row of input.contactRows) {
    playerIds.add(row.player_id);
  }

  return Array.from(playerIds)
    .map((playerId) => {
      const scan = scansByPlayer.get(playerId);
      const saved = savedByPlayer.get(playerId);
      const contact = contactsByPlayer.get(playerId);

      return {
        player_id: playerId,
        scan_count: scan?.scan_count ?? 0,
        last_scan_at: scan?.last_scan_at,
        email: contact?.email ?? saved?.email,
        phone_number: contact?.phone_number
      };
    })
    .sort((a, b) => {
      if (a.last_scan_at && b.last_scan_at) {
        return b.last_scan_at.localeCompare(a.last_scan_at);
      }

      if (a.last_scan_at) return -1;
      if (b.last_scan_at) return 1;
      return a.player_id.localeCompare(b.player_id);
    });
}

function playerEmailMapFromRows(input: {
  savedRows: SavedPlayerEmailRow[];
  contactRows: PlayerContact[];
}) {
  const playerEmails = new Map<string, string>();

  for (const row of input.savedRows) {
    const email = row.email?.trim();
    if (email && !playerEmails.has(row.player_id)) {
      playerEmails.set(row.player_id, email);
    }
  }

  for (const row of input.contactRows) {
    const email = row.email?.trim();
    if (email) {
      playerEmails.set(row.player_id, email);
    }
  }

  return playerEmails;
}

function playerIdentityMapFromRows(input: {
  savedRows: SavedPlayerEmailRow[];
  contactRows: PlayerContact[];
}) {
  const playerIdentities = playerEmailMapFromRows(input);

  for (const row of input.contactRows) {
    const phoneNumber = row.phone_number?.trim();
    if (phoneNumber && !playerIdentities.has(row.player_id)) {
      playerIdentities.set(row.player_id, phoneNumber);
    }
  }

  return playerIdentities;
}

function normalizePlayerScanRows(rows: D1PlayerScanRow[]): PlayerScanRow[] {
  return rows.map((row) => ({
    player_id: row.player_id,
    scan_count: Number(row.scan_count) || 0,
    last_scan_at: row.last_scan_at ?? undefined
  }));
}

function normalizePlayerContactRow(row: D1PlayerContactRow): PlayerContact {
  return {
    player_id: row.player_id,
    email: row.email ?? undefined,
    phone_number: row.phone_number ?? undefined,
    email_updated_at: row.email_updated_at ?? undefined,
    phone_updated_at: row.phone_updated_at ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export async function getProgress(playerId: string): Promise<{
  player_id: string;
  marker_ids: string[];
  scans: ScanRecord[];
  saved_email?: string;
}> {
  const d1 = await getD1();

  if (d1) {
    const scanResult = await d1
      .prepare(
        `select player_id, marker_id, scanned_at, user_agent
         from marker_scans
         where player_id = ?
         order by scanned_at asc`
      )
      .bind(playerId)
      .all<ScanRecord>();
    const scans = scanResult.results ?? [];
    const marker_ids = Array.from(new Set(scans.map((scan) => scan.marker_id)));
    const saved = await d1
      .prepare("select email from saved_players where player_id = ?")
      .bind(playerId)
      .first<{ email: string }>();

    return {
      player_id: playerId,
      marker_ids,
      scans,
      saved_email: saved?.email
    };
  }

  const db = await readLocalDb();
  const scans = db.scans
    .filter((scan) => scan.player_id === playerId)
    .sort((a, b) => a.scanned_at.localeCompare(b.scanned_at));
  const marker_ids = Array.from(new Set(scans.map((scan) => scan.marker_id)));
  const saved = db.saved_players.find((player) => player.player_id === playerId);

  return {
    player_id: playerId,
    marker_ids,
    scans,
    saved_email: saved?.email
  };
}

export async function saveProgress(input: {
  player_id: string;
  email: string;
  marker_ids: string[];
  user_agent?: string;
}): Promise<
  | {
      mode: "email_sent";
      message: string;
    }
  | {
      recovery_code: string;
      mode: "stub";
      message: string;
    }
> {
  await backfillScans(input);

  const email = input.email.trim().toLowerCase();
  const d1 = await getD1();

  if (d1) {
    const existing = await d1
      .prepare("select recovery_code from saved_players where player_id = ?")
      .bind(input.player_id)
      .first<{ recovery_code: string }>();
    const recovery_code = existing?.recovery_code ?? makeRecoveryCode();

    await d1
      .prepare(
        `insert into saved_players (player_id, email, saved_at, recovery_code)
         values (?, ?, ?, ?)
         on conflict(player_id) do update set
           email = excluded.email,
           saved_at = excluded.saved_at,
           recovery_code = excluded.recovery_code`
      )
      .bind(input.player_id, email, new Date().toISOString(), recovery_code)
      .run();
    await upsertD1PlayerContact(d1, {
      player_id: input.player_id,
      email,
      email_updated_at: new Date().toISOString()
    });

    return sendSavedProgressMessage({
      player_id: input.player_id,
      email,
      recovery_code,
      marker_count: input.marker_ids.length
    });
  }

  const db = await readLocalDb();
  const existing = db.saved_players.find((player) => player.player_id === input.player_id);
  const recovery_code = existing?.recovery_code ?? makeRecoveryCode();
  const savedPlayer: SavedPlayer = {
    player_id: input.player_id,
    email,
    saved_at: new Date().toISOString(),
    recovery_code
  };

  db.saved_players = [
    ...db.saved_players.filter((player) => player.player_id !== input.player_id),
    savedPlayer
  ];
  upsertLocalPlayerContact(db, {
    player_id: input.player_id,
    email,
    email_updated_at: savedPlayer.saved_at
  });

  await writeLocalDb(db);

  return sendSavedProgressMessage({
    player_id: input.player_id,
    email,
    recovery_code,
    marker_count: input.marker_ids.length
  });
}

export async function requestRecovery(input: {
  email: string;
  recovery_code?: string;
}): Promise<
  | {
      mode: "recovered";
      player_id: string;
      marker_ids: string[];
    }
  | {
      mode: "email_sent";
      message: string;
    }
  | {
      mode: "stub";
      message: string;
    }
> {
  const email = input.email.trim().toLowerCase();
  const d1 = await getD1();

  if (d1) {
    const saved = await d1
      .prepare(
        `select player_id, recovery_code
         from saved_players
         where email = ?
         order by saved_at desc
         limit 1`
      )
      .bind(email)
      .first<Pick<SavedPlayer, "player_id" | "recovery_code">>();

    if (saved && input.recovery_code && input.recovery_code === saved.recovery_code) {
      const progress = await getProgress(saved.player_id);
      return {
        mode: "recovered",
        player_id: saved.player_id,
        marker_ids: progress.marker_ids
      };
    }

    const recoveryMode = saved ? "email_sent" : "not_found";
    await d1
      .prepare(
        `insert into recovery_requests (email, requested_at, mode)
         values (?, ?, ?)`
      )
      .bind(email, new Date().toISOString(), recoveryMode)
      .run();

    return sendRecoveryMessage(
      saved ? { player_id: saved.player_id, email, recovery_code: saved.recovery_code } : undefined,
      saved ? undefined : { email, mode: "not_found" }
    );
  }

  const db = await readLocalDb();
  const saved = db.saved_players
    .filter((player) => player.email === email)
    .sort((a, b) => b.saved_at.localeCompare(a.saved_at))[0];

  if (saved && input.recovery_code && input.recovery_code === saved.recovery_code) {
    const progress = await getProgress(saved.player_id);
    return {
      mode: "recovered",
      player_id: saved.player_id,
      marker_ids: progress.marker_ids
    };
  }

  db.recovery_requests.push({
    email,
    requested_at: new Date().toISOString(),
    mode: saved ? "email_sent" : "not_found"
  });
  await writeLocalDb(db);

  return sendRecoveryMessage(
    saved ? { player_id: saved.player_id, email, recovery_code: saved.recovery_code } : undefined,
    saved ? undefined : { email, mode: "not_found" }
  );
}

export async function recoverProgressByCode(recoveryCode: string): Promise<
  | {
      mode: "recovered";
      player_id: string;
      marker_ids: string[];
    }
  | {
      mode: "not_found";
      message: string;
    }
> {
  const code = recoveryCode.trim().toUpperCase();

  if (!code) {
    return recoveryCodeNotFoundResponse();
  }

  const d1 = await getD1();

  if (d1) {
    const saved = await d1
      .prepare(
        `select player_id
         from saved_players
         where recovery_code = ?
         order by saved_at desc
         limit 1`
      )
      .bind(code)
      .first<Pick<SavedPlayer, "player_id">>();

    if (!saved) {
      return recoveryCodeNotFoundResponse();
    }

    const progress = await getProgress(saved.player_id);
    return {
      mode: "recovered",
      player_id: saved.player_id,
      marker_ids: progress.marker_ids
    };
  }

  const db = await readLocalDb();
  const saved = db.saved_players
    .filter((player) => player.recovery_code === code)
    .sort((a, b) => b.saved_at.localeCompare(a.saved_at))[0];

  if (!saved) {
    return recoveryCodeNotFoundResponse();
  }

  const progress = await getProgress(saved.player_id);
  return {
    mode: "recovered",
    player_id: saved.player_id,
    marker_ids: progress.marker_ids
  };
}

async function sendSavedProgressMessage(input: {
  player_id: string;
  email: string;
  recovery_code: string;
  marker_count: number;
}): Promise<
  | {
      mode: "email_sent";
      message: string;
    }
  | {
      recovery_code: string;
      mode: "stub";
      message: string;
    }
> {
  const delivery = await sendProgressSavedEmail(input);

  if (delivery.ok) {
    await recordMessageEvent({
      player_id: input.player_id,
      recipient: input.email,
      channel: "email",
      message_type: "progress_saved",
      provider: delivery.provider,
      provider_message_id: delivery.message_id,
      status: "sent"
    });
    return {
      mode: "email_sent",
      message: "Progress saved. We emailed your recovery link."
    };
  }

  if (delivery.reason === "provider_error") {
    console.error("Famous Land recovery email failed", delivery.error);
  }

  await recordMessageEvent({
    player_id: input.player_id,
    recipient: input.email,
    channel: "email",
    message_type: "progress_saved",
    provider: "brevo",
    status: "stub",
    error: delivery.error ?? delivery.reason
  });

  return {
    recovery_code: input.recovery_code,
    mode: "stub",
    message:
      "Progress saved. Email is not available right now, so keep this recovery link code."
  };
}

async function sendRecoveryMessage(input?: {
  player_id: string;
  email: string;
  recovery_code: string;
}, notFound?: { email: string; mode: "not_found" }): Promise<
  | {
      mode: "email_sent";
      message: string;
    }
  | {
      mode: "stub";
      message: string;
    }
> {
  if (!input) {
    if (notFound) {
      await recordAdminAuditEvent({
        action: "recovery.request",
        target: notFound.email,
        result: notFound.mode,
        detail: "Recovery requested for an email without saved progress."
      });
    }

    if (!(await isEmailDeliveryConfigured())) {
      return recoveryStubResponse();
    }

    return {
      mode: "email_sent",
      message: "If progress exists for that email, a recovery link is on the way."
    };
  }

  const delivery = await sendRecoveryEmail(input);

  if (delivery.ok) {
    await recordMessageEvent({
      player_id: input.player_id,
      recipient: input.email,
      channel: "email",
      message_type: "recovery",
      provider: delivery.provider,
      provider_message_id: delivery.message_id,
      status: "sent"
    });
    await recordAdminAuditEvent({
      action: "recovery.email",
      player_id: input.player_id,
      target: input.email,
      result: "sent",
      detail: "Recovery email sent."
    });
    return {
      mode: "email_sent",
      message: "If progress exists for that email, a recovery link is on the way."
    };
  }

  if (delivery.reason === "provider_error") {
    console.error("Famous Land recovery email failed", delivery.error);
  }

  await recordMessageEvent({
    player_id: input.player_id,
    recipient: input.email,
    channel: "email",
    message_type: "recovery",
    provider: "brevo",
    status: "stub",
    error: delivery.error ?? delivery.reason
  });
  await recordAdminAuditEvent({
    action: "recovery.email",
    player_id: input.player_id,
    target: input.email,
    result: "stub",
    detail: delivery.error ?? delivery.reason
  });

  return recoveryStubResponse();
}

async function recordD1Scan(
  d1: FamousLandD1,
  input: {
    player_id: string;
    marker_id: string;
    user_agent?: string;
    is_test?: boolean;
    track_event?: boolean;
  }
): Promise<{ is_new: boolean; scan: ScanRecord }> {
  const scan: ScanRecord = {
    player_id: input.player_id,
    marker_id: input.marker_id,
    scanned_at: new Date().toISOString(),
    user_agent: input.user_agent,
    is_test: input.is_test === true
  };

  if (input.track_event !== false) {
    await recordD1ScanEvent(d1, makeScanEvent(scan, { progress_eligible: true }));
  }

  const result = await d1
    .prepare(
      `insert or ignore into marker_scans (player_id, marker_id, scanned_at, user_agent)
       values (?, ?, ?, ?)`
    )
    .bind(scan.player_id, scan.marker_id, scan.scanned_at, scan.user_agent ?? null)
    .run();

  if (result.meta?.changes === 0) {
    const existing = await d1
      .prepare(
        `select player_id, marker_id, scanned_at, user_agent
         from marker_scans
         where player_id = ? and marker_id = ?`
      )
      .bind(input.player_id, input.marker_id)
      .first<ScanRecord>();

    if (existing) {
      return { is_new: false, scan: existing };
    }
  }

  return { is_new: true, scan };
}

async function recordD1ScanEvent(d1: FamousLandD1, event: ScanEventRecord) {
  try {
    const result = await d1
      .prepare(
        `insert into scan_events (
           id,
           player_id,
           marker_id,
           scanned_at,
           user_agent,
           is_test,
           email_id,
           progress_eligible
         )
         values (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        event.id,
        event.player_id,
        event.marker_id,
        event.scanned_at,
        event.user_agent ?? null,
        event.is_test === true ? 1 : 0,
        event.email_id ?? null,
        event.progress_eligible ? 1 : 0
      )
      .run();

    if (!result.success) {
      console.error("Famous Land scan event insert failed", result.error);
    }
  } catch (error) {
    try {
      const result = await d1
        .prepare(
          `insert into scan_events (id, player_id, marker_id, scanned_at, user_agent, is_test)
           values (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          event.id,
          event.player_id,
          event.marker_id,
          event.scanned_at,
          event.user_agent ?? null,
          event.is_test === true ? 1 : 0
        )
        .run();

      if (!result.success) {
        console.error("Famous Land scan event insert failed", result.error);
      }
    } catch {
      try {
        const result = await d1
        .prepare(
          `insert into scan_events (id, player_id, marker_id, scanned_at, user_agent)
           values (?, ?, ?, ?, ?)`
        )
        .bind(
          event.id,
          event.player_id,
          event.marker_id,
          event.scanned_at,
          event.user_agent ?? null
        )
        .run();

      if (!result.success) {
        console.error("Famous Land scan event insert failed", result.error);
      }
      } catch (fallbackError) {
        console.error("Famous Land scan event insert failed", fallbackError);
      }
    }
  }
}

async function upsertD1PlayerContact(d1: FamousLandD1, input: PlayerContactUpdate) {
  const now = new Date().toISOString();

  try {
    const result = await d1
      .prepare(
        `insert into player_contacts (
           player_id,
           email,
           phone_number,
           email_updated_at,
           phone_updated_at,
           created_at,
           updated_at
         )
         values (?, ?, ?, ?, ?, ?, ?)
         on conflict(player_id) do update set
           email = coalesce(excluded.email, player_contacts.email),
           phone_number = coalesce(excluded.phone_number, player_contacts.phone_number),
           email_updated_at = coalesce(excluded.email_updated_at, player_contacts.email_updated_at),
           phone_updated_at = coalesce(excluded.phone_updated_at, player_contacts.phone_updated_at),
           updated_at = excluded.updated_at`
      )
      .bind(
        input.player_id,
        input.email ?? null,
        input.phone_number ?? null,
        input.email_updated_at ?? null,
        input.phone_updated_at ?? null,
        now,
        now
      )
      .run();

    if (!result.success) {
      console.error("Famous Land player contact upsert failed", result.error);
    }
  } catch (error) {
    console.error("Famous Land player contact upsert failed", error);
  }
}

function upsertLocalPlayerContact(db: DbShape, input: PlayerContactUpdate) {
  const now = new Date().toISOString();
  const existing = db.player_contacts.find((contact) => contact.player_id === input.player_id);
  const nextContact: PlayerContact = {
    player_id: input.player_id,
    email: input.email ?? existing?.email,
    phone_number: input.phone_number ?? existing?.phone_number,
    email_updated_at: input.email_updated_at ?? existing?.email_updated_at,
    phone_updated_at: input.phone_updated_at ?? existing?.phone_updated_at,
    created_at: existing?.created_at ?? now,
    updated_at: now
  };

  db.player_contacts = [
    ...db.player_contacts.filter((contact) => contact.player_id !== input.player_id),
    nextContact
  ];
}

function contactsFromSavedPlayers(savedPlayers: SavedPlayer[] | SavedPlayerEmailRow[]): PlayerContact[] {
  const contacts = new Map<string, PlayerContact>();

  for (const player of savedPlayers) {
    if (contacts.has(player.player_id)) {
      continue;
    }

    contacts.set(player.player_id, {
      player_id: player.player_id,
      email: player.email,
      email_updated_at: player.saved_at,
      created_at: player.saved_at,
      updated_at: player.saved_at
    });
  }

  return Array.from(contacts.values());
}

async function getD1ScanEvents(d1: FamousLandD1): Promise<ScanEventRecord[]> {
  try {
    const eventResult = await d1
      .prepare(
        `select id, player_id, marker_id, scanned_at, user_agent, is_test
              , email_id, progress_eligible
         from scan_events
         order by scanned_at desc`
      )
      .all<D1ScanEventRow>();

    if (!eventResult.success) {
      throw new Error(eventResult.error ?? "scan_events query failed");
    }

    return (eventResult.results ?? []).map(normalizeD1ScanEvent);
  } catch {
    try {
      const eventResult = await d1
        .prepare(
          `select id, player_id, marker_id, scanned_at, user_agent
           from scan_events
           order by scanned_at desc`
        )
        .all<D1ScanEventRow>();

      if (!eventResult.success) {
        throw new Error(eventResult.error ?? "scan_events query failed");
      }

      return (eventResult.results ?? []).map(normalizeD1ScanEvent);
    } catch {
      try {
        const scanResult = await d1
          .prepare(
            `select player_id, marker_id, scanned_at, user_agent
             from marker_scans
             order by scanned_at desc`
          )
          .all<ScanRecord>();

        return (scanResult.results ?? []).map(scanToLegacyEvent);
      } catch (error) {
        if (!isMissingTableError(error)) {
          console.error("Famous Land scan event query failed", error);
        }
        return [];
      }
    }
  }
}

function makeScanEvent(
  scan: ScanRecord,
  options: {
    email_id?: string;
    progress_eligible?: boolean;
  } = {}
): ScanEventRecord {
  return {
    id: makeScanEventId(),
    ...scan,
    is_test: scan.is_test === true,
    email_id: options.email_id,
    progress_eligible: options.progress_eligible !== false
  };
}

function normalizeD1ScanEvent(event: D1ScanEventRow): ScanEventRecord {
  return {
    id: event.id,
    player_id: event.player_id,
    marker_id: event.marker_id,
    scanned_at: event.scanned_at,
    user_agent: event.user_agent ?? undefined,
    is_test: normalizeBoolean(event.is_test),
    email_id: event.email_id ?? undefined,
    progress_eligible: event.progress_eligible === undefined ? true : normalizeBoolean(event.progress_eligible)
  };
}

function normalizeLocalScanEvent(event: ScanEventRecord): ScanEventRecord {
  return {
    ...event,
    email_id: event.email_id || undefined,
    is_test: event.is_test === true,
    progress_eligible: event.progress_eligible !== false
  };
}

function scanToLegacyEvent(scan: ScanRecord): ScanEventRecord {
  return {
    id: `legacy:${scan.player_id}:${scan.marker_id}`,
    player_id: scan.player_id,
    marker_id: scan.marker_id,
    scanned_at: scan.scanned_at,
    user_agent: scan.user_agent,
    is_test: scan.is_test === true,
    progress_eligible: true
  };
}

function normalizeBoolean(value: boolean | number | string | null | undefined) {
  return value === true || value === 1 || value === "1";
}

function makeScanEventId(): string {
  return crypto.randomUUID();
}

function isMissingTableError(error: unknown) {
  return error instanceof Error && /no such table/i.test(error.message);
}

function buildTimeline(events: ScanEventRecord[], filters: ScanReportFilters): ScanTimelineBucket[] {
  if (filters.unit === "month") {
    return buildMonthTimeline(events, filters);
  }

  const startMs = dateInputMs(filters.start_date);
  const endMs = dateInputMs(filters.end_date) + REPORT_DAY_MS;
  const bucketSize = timelineBucketMs(filters.unit);
  const bucketCount = Math.max(1, Math.ceil((endMs - startMs) / bucketSize));
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStartMs = startMs + index * bucketSize;
    const bucketEndMs = Math.min(bucketStartMs + bucketSize, endMs) - REPORT_DAY_MS;

    return {
      label: timelineBucketLabel(bucketStartMs, filters.unit),
      start_date: isoDateFromUtcMs(bucketStartMs),
      end_date: isoDateFromUtcMs(bucketEndMs),
      count: 0
    };
  });

  for (const event of events) {
    const eventDayMs = easternDayMs(event.scanned_at);

    if (eventDayMs === undefined || eventDayMs < startMs || eventDayMs >= endMs) {
      continue;
    }

    const bucketIndex = Math.floor((eventDayMs - startMs) / bucketSize);
    buckets[bucketIndex].count += 1;
  }

  return buckets;
}

function buildMonthTimeline(
  events: ScanEventRecord[],
  filters: ScanReportFilters
): ScanTimelineBucket[] {
  const startMs = dateInputMs(filters.start_date);
  const endExclusiveMs = dateInputMs(filters.end_date) + REPORT_DAY_MS;
  const startDate = new Date(startMs);
  const endDate = new Date(dateInputMs(filters.end_date));
  const firstMonthMs = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1);
  const lastMonthIndex = endDate.getUTCFullYear() * 12 + endDate.getUTCMonth();
  const firstMonthIndex = startDate.getUTCFullYear() * 12 + startDate.getUTCMonth();
  const bucketCount = Math.max(1, lastMonthIndex - firstMonthIndex + 1);
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const monthStartMs = addMonths(firstMonthMs, index);
    const monthEndExclusiveMs = addMonths(firstMonthMs, index + 1);
    const bucketStartMs = Math.max(monthStartMs, startMs);
    const bucketEndExclusiveMs = Math.min(monthEndExclusiveMs, endExclusiveMs);

    return {
      label: timelineBucketLabel(monthStartMs, "month"),
      start_date: isoDateFromUtcMs(bucketStartMs),
      end_date: isoDateFromUtcMs(bucketEndExclusiveMs - REPORT_DAY_MS),
      count: 0
    };
  });

  for (const event of events) {
    const eventDayMs = easternDayMs(event.scanned_at);

    if (eventDayMs === undefined || eventDayMs < startMs || eventDayMs >= endExclusiveMs) {
      continue;
    }

    const eventDate = new Date(eventDayMs);
    const eventMonthIndex = eventDate.getUTCFullYear() * 12 + eventDate.getUTCMonth();
    const bucketIndex = eventMonthIndex - firstMonthIndex;

    if (buckets[bucketIndex]) {
      buckets[bucketIndex].count += 1;
    }
  }

  return buckets;
}

function timelineLabel(filters: ScanReportFilters): string {
  const startMs = dateInputMs(filters.start_date);
  const endMs = dateInputMs(filters.end_date);
  return `${longDateFormatter.format(new Date(startMs))} - ${longDateFormatter.format(
    new Date(endMs)
  )}`;
}

function defaultTimelineDateRange() {
  const year = new Date().getFullYear();
  const startMs = Date.UTC(year, REPORT_START_MONTH_INDEX, 1);
  const endMs = Date.UTC(year, REPORT_START_MONTH_INDEX + REPORT_MONTHS, 1) - REPORT_DAY_MS;

  return {
    start_date: isoDateFromUtcMs(startMs),
    end_date: isoDateFromUtcMs(endMs)
  };
}

function timelineBucketMs(unit: ScanTimelineUnit) {
  if (unit === "day") return REPORT_DAY_MS;
  return REPORT_WEEK_MS;
}

function timelineBucketLabel(ms: number, unit: ScanTimelineUnit) {
  if (unit === "month") {
    return shortDateFormatter.format(new Date(ms)).replace(/ \d+$/, "");
  }

  return shortDateFormatter.format(new Date(ms));
}

function validIsoDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return value;
}

function dateInputMs(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function addMonths(ms: number, months: number) {
  const date = new Date(ms);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1);
}

function easternDayMs(isoDate: string): number | undefined {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const parts = easternDatePartsFormatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) {
    return undefined;
  }

  return Date.UTC(year, month - 1, day);
}

function isoDateFromUtcMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function recoveryStubResponse(): { mode: "stub"; message: string } {
  return {
    mode: "stub",
    message:
      "Email is not available right now. If you saved progress locally, open /recover/YOUR-CODE on the device you want to restore."
  };
}

function recoveryCodeNotFoundResponse(): { mode: "not_found"; message: string } {
  return {
    mode: "not_found",
    message: "That recovery link is not valid. Request a new recovery email and try again."
  };
}

function makeRecoveryCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}
