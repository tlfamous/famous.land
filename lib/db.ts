import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { markers } from "@/lib/markers";
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
  mode: "stub";
};

type DbShape = {
  scans: ScanRecord[];
  saved_players: SavedPlayer[];
  recovery_requests: RecoveryRequest[];
};

const emptyDb: DbShape = {
  scans: [],
  saved_players: [],
  recovery_requests: []
};

function dbPath(): string {
  if (process.env.FAMOUS_LAND_DB_PATH) {
    return process.env.FAMOUS_LAND_DB_PATH;
  }

  if (process.env.VERCEL) {
    return "/tmp/famous-land-db.json";
  }

  return path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    ".data",
    "famous-land-db.json"
  );
}

async function readDb(): Promise<DbShape> {
  const file = dbPath();

  try {
    const raw = await fs.readFile(file, "utf8");
    return { ...emptyDb, ...(JSON.parse(raw) as Partial<DbShape>) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyDb;
    }

    throw error;
  }
}

async function writeDb(db: DbShape) {
  const file = dbPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8");
}

export async function recordScan(input: {
  player_id: string;
  marker_id: string;
  user_agent?: string;
}): Promise<{ is_new: boolean; scan: ScanRecord }> {
  const db = await readDb();
  const existing = db.scans.find(
    (scan) => scan.player_id === input.player_id && scan.marker_id === input.marker_id
  );

  if (existing) {
    return { is_new: false, scan: existing };
  }

  const scan: ScanRecord = {
    player_id: input.player_id,
    marker_id: input.marker_id,
    scanned_at: new Date().toISOString(),
    user_agent: input.user_agent
  };

  db.scans.push(scan);
  await writeDb(db);
  return { is_new: true, scan };
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
        user_agent: input.user_agent
      });
    }
  }
}

export async function getProgress(playerId: string): Promise<{
  player_id: string;
  marker_ids: string[];
  scans: ScanRecord[];
  saved_email?: string;
}> {
  const db = await readDb();
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
}): Promise<{ recovery_code: string; mode: "stub" }> {
  await backfillScans(input);

  const db = await readDb();
  const email = input.email.trim().toLowerCase();
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

  await writeDb(db);

  // TODO: Connect Resend, SendGrid, Postmark, or another provider here.
  // Send a magic link or the recovery code to `email`; do not expose email publicly.
  return { recovery_code, mode: "stub" };
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
      mode: "stub";
      message: string;
    }
> {
  const db = await readDb();
  const email = input.email.trim().toLowerCase();
  const saved = db.saved_players.find((player) => player.email === email);

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
    mode: "stub"
  });
  await writeDb(db);

  // TODO: Connect Resend, SendGrid, Postmark, or another provider here.
  // In production, email a short-lived magic link that restores the saved player_id.
  return {
    mode: "stub",
    message:
      "Recovery email sending is stubbed. If you saved progress locally, enter your recovery code to restore this device."
  };
}

function makeRecoveryCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}
