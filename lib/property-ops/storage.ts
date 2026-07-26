import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSeedLocalHomesStore } from "./seeds";
import type { LocalHomesStore } from "./types";

export type D1RunResult = {
  success: boolean;
  error?: string;
  meta?: { changes?: number };
};

export type D1QueryResult<T> = {
  results?: T[];
  success: boolean;
  error?: string;
};

export type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1QueryResult<T>>;
  run(): Promise<D1RunResult>;
};

export type HomesD1 = {
  prepare(query: string): D1Statement;
  batch?(statements: D1Statement[]): Promise<D1RunResult[]>;
};

export async function getHomesD1(): Promise<HomesD1 | undefined> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as { DB?: HomesD1; famous_land_quest?: HomesD1 };
    return env.DB ?? env.famous_land_quest;
  } catch {
    return undefined;
  }
}

let localMutationQueue: Promise<void> = Promise.resolve();

async function localStorePath(): Promise<string> {
  if (process.env.FAMOUS_LAND_HOMES_DB_PATH) {
    return process.env.FAMOUS_LAND_HOMES_DB_PATH;
  }

  if (process.env.VERCEL) return "/tmp/famous-land-homes.json";
  const path = await import("node:path");
  return path.join(process.cwd(), ".data", "famous-land-homes.json");
}

function normalizeLocalStore(value: Partial<LocalHomesStore>): LocalHomesStore {
  if (value.schemaVersion !== 1) {
    throw new Error("Unsupported local homes database version.");
  }

  const requiredArrays: Array<keyof Omit<LocalHomesStore, "schemaVersion">> = [
    "homes",
    "guideSections",
    "inventory",
    "manuals",
    "media",
    "secrets",
    "auditEvents"
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(value[key])) {
      throw new Error(`Local homes database is missing the ${key} collection.`);
    }
  }

  const normalized = structuredClone(value as LocalHomesStore);
  const legacyPublications = (value as Partial<LocalHomesStore> & {
    publications?: Array<LocalHomesStore["publishedGuides"][number] & { revision?: number }>;
  }).publications;
  normalized.publishedGuides = Array.isArray(value.publishedGuides)
    ? structuredClone(value.publishedGuides)
    : Array.isArray(legacyPublications)
      ? Array.from(
          new Map(
            [...legacyPublications]
              .sort((a, b) => (b.revision ?? 0) - (a.revision ?? 0))
              .map((publication) => [publication.homeId, publication])
          ).values()
        ).map(({ revision: _revision, ...publication }) => structuredClone(publication))
      : [];
  // schemaVersion 1 predates permanent slug redirects. Treat the missing
  // collection as empty instead of forcing operators to discard local data.
  normalized.slugRedirects = Array.isArray(value.slugRedirects)
    ? structuredClone(value.slugRedirects)
    : [];
  normalized.airbnbCaptures = Array.isArray(value.airbnbCaptures)
    ? structuredClone(value.airbnbCaptures)
    : [];
  normalized.purchases = Array.isArray(value.purchases)
    ? structuredClone(value.purchases)
    : [];
  normalized.lockDevices = Array.isArray(value.lockDevices)
    ? structuredClone(value.lockDevices)
    : [];
  normalized.lockEvents = Array.isArray(value.lockEvents)
    ? structuredClone(value.lockEvents)
    : [];
  normalized.activityEvents = Array.isArray(value.activityEvents)
    ? structuredClone(value.activityEvents)
    : [];
  normalized.networkIntegrations = Array.isArray(value.networkIntegrations)
    ? structuredClone(value.networkIntegrations)
    : [];
  normalized.integrations = Array.isArray(value.integrations)
    ? structuredClone(value.integrations)
    : [];
  normalized.equipmentReadings = Array.isArray(value.equipmentReadings)
    ? structuredClone(value.equipmentReadings)
    : [];
  normalized.alerts = Array.isArray(value.alerts)
    ? structuredClone(value.alerts)
    : [];
  return normalized;
}

export async function readLocalHomesStore(): Promise<LocalHomesStore> {
  const fs = await import("node:fs/promises");
  const file = await localStorePath();

  try {
    const raw = await fs.readFile(file, "utf8");
    return normalizeLocalStore(JSON.parse(raw) as Partial<LocalHomesStore>);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createSeedLocalHomesStore();
    }
    throw error;
  }
}

async function writeLocalHomesStore(store: LocalHomesStore): Promise<void> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const file = await localStorePath();
  const temporaryFile = `${file}.${crypto.randomUUID()}.tmp`;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(temporaryFile, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(temporaryFile, file);
}

export async function mutateLocalHomesStore<T>(
  mutation: (store: LocalHomesStore) => T | Promise<T>
): Promise<T> {
  let resolveResult!: (value: T | PromiseLike<T>) => void;
  let rejectResult!: (reason?: unknown) => void;
  const result = new Promise<T>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  localMutationQueue = localMutationQueue
    .then(async () => {
      const store = await readLocalHomesStore();
      const value = await mutation(store);
      await writeLocalHomesStore(store);
      resolveResult(value);
    })
    .catch((error) => {
      rejectResult(error);
    });

  return result;
}

export function assertD1Success(result: D1RunResult, message: string): void {
  if (!result.success) throw new Error(result.error ?? message);
}

export async function runD1Batch(d1: HomesD1, statements: D1Statement[]): Promise<void> {
  if (d1.batch) {
    const results = await d1.batch(statements);
    for (const result of results) assertD1Success(result, "Homes database batch failed.");
    return;
  }

  for (const statement of statements) {
    assertD1Success(await statement.run(), "Homes database mutation failed.");
  }
}

/**
 * D1 batch() executes its statements as one transaction. Use this for mutations
 * whose safety depends on statement ordering; unlike runD1Batch, it deliberately
 * has no sequential fallback.
 */
export async function runD1AtomicBatch(
  d1: HomesD1,
  statements: D1Statement[]
): Promise<void> {
  if (!d1.batch) {
    throw new Error("This homes mutation requires D1 transactional batch support.");
  }
  const results = await d1.batch(statements);
  for (const result of results) {
    assertD1Success(result, "Atomic homes database mutation failed.");
  }
}
