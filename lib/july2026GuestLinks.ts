import { getCloudflareContext } from "@opennextjs/cloudflare";
import { guestAssignments } from "@/app/july2026/data";

export type JulyGuestLink = {
  slug: string;
  token: string;
  created_at: string;
  updated_at: string;
  bound_device_id?: string;
  bound_at?: string;
  reset_at?: string;
};

type D1RunResult = {
  success: boolean;
  error?: string;
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

type LocalStore = {
  links: JulyGuestLink[];
};

const emptyStore: LocalStore = {
  links: []
};

let d1SchemaReady = false;

async function getD1(): Promise<FamousLandD1 | undefined> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as {
      DB?: FamousLandD1;
      famous_land_quest?: FamousLandD1;
    };

    return env.DB ?? env.famous_land_quest;
  } catch {
    return undefined;
  }
}

async function ensureD1Schema(d1: FamousLandD1) {
  if (d1SchemaReady) {
    return;
  }

  await d1
    .prepare(
      `create table if not exists july2026_guest_links (
        slug text primary key,
        token text not null,
        created_at text not null,
        updated_at text not null,
        bound_device_id text,
        bound_at text,
        reset_at text
      )`
    )
    .run();
  await d1
    .prepare(
      `create unique index if not exists july2026_guest_links_token_idx
       on july2026_guest_links (token)`
    )
    .run();
  await d1
    .prepare(
      `create index if not exists july2026_guest_links_bound_idx
       on july2026_guest_links (bound_at desc)`
    )
    .run();
  d1SchemaReady = true;
}

async function localStorePath() {
  const path = await import("node:path");
  return path.join(process.cwd(), ".data", "july2026-guest-links.json");
}

async function readLocalStore(): Promise<LocalStore> {
  const fs = await import("node:fs/promises");
  const file = await localStorePath();

  try {
    const raw = await fs.readFile(file, "utf8");
    return { ...emptyStore, ...(JSON.parse(raw) as Partial<LocalStore>) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyStore;
    }

    throw error;
  }
}

async function writeLocalStore(store: LocalStore) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const file = await localStorePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
}

function makeToken() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 16);
}

function normalizeRow(row: JulyGuestLink): JulyGuestLink {
  return {
    slug: row.slug,
    token: row.token,
    created_at: row.created_at,
    updated_at: row.updated_at,
    bound_device_id: row.bound_device_id ?? undefined,
    bound_at: row.bound_at ?? undefined,
    reset_at: row.reset_at ?? undefined
  };
}

async function ensureD1Link(d1: FamousLandD1, slug: string): Promise<JulyGuestLink> {
  await ensureD1Schema(d1);

  const existing = await d1
    .prepare("select * from july2026_guest_links where slug = ?")
    .bind(slug)
    .first<JulyGuestLink>();

  if (existing) {
    return normalizeRow(existing);
  }

  const now = new Date().toISOString();
  const token = makeToken();
  await d1
    .prepare(
      `insert into july2026_guest_links (slug, token, created_at, updated_at)
       values (?, ?, ?, ?)`
    )
    .bind(slug, token, now, now)
    .run();

  return {
    slug,
    token,
    created_at: now,
    updated_at: now
  };
}

async function ensureLocalLink(store: LocalStore, slug: string): Promise<JulyGuestLink> {
  const existing = store.links.find((link) => link.slug === slug);

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const link = {
    slug,
    token: makeToken(),
    created_at: now,
    updated_at: now
  };
  store.links.push(link);
  await writeLocalStore(store);
  return link;
}

export async function listJulyGuestLinks(): Promise<JulyGuestLink[]> {
  const d1 = await getD1();
  const slugs = guestAssignments.map((guest) => guest.slug);

  if (d1) {
    await ensureD1Schema(d1);
    await Promise.all(slugs.map((slug) => ensureD1Link(d1, slug)));
    const result = await d1
      .prepare("select * from july2026_guest_links order by slug asc")
      .all<JulyGuestLink>();
    const rows = result.results ?? [];
    return rows.filter((row) => slugs.includes(row.slug)).map(normalizeRow);
  }

  const store = await readLocalStore();
  await Promise.all(slugs.map((slug) => ensureLocalLink(store, slug)));
  return store.links.filter((link) => slugs.includes(link.slug));
}

export async function regenerateJulyGuestLink(slug: string): Promise<JulyGuestLink> {
  const d1 = await getD1();
  const now = new Date().toISOString();
  const token = makeToken();

  if (d1) {
    await ensureD1Link(d1, slug);
    await d1
      .prepare(
        `update july2026_guest_links
         set token = ?, updated_at = ?, bound_device_id = null, bound_at = null, reset_at = ?
         where slug = ?`
      )
      .bind(token, now, now, slug)
      .run();
    return ensureD1Link(d1, slug);
  }

  const store = await readLocalStore();
  const link = await ensureLocalLink(store, slug);
  link.token = token;
  link.updated_at = now;
  link.bound_device_id = undefined;
  link.bound_at = undefined;
  link.reset_at = now;
  await writeLocalStore(store);
  return link;
}

export async function resetJulyGuestBinding(slug: string): Promise<JulyGuestLink> {
  const d1 = await getD1();
  const now = new Date().toISOString();

  if (d1) {
    await ensureD1Link(d1, slug);
    await d1
      .prepare(
        `update july2026_guest_links
         set updated_at = ?, bound_device_id = null, bound_at = null, reset_at = ?
         where slug = ?`
      )
      .bind(now, now, slug)
      .run();
    return ensureD1Link(d1, slug);
  }

  const store = await readLocalStore();
  const link = await ensureLocalLink(store, slug);
  link.updated_at = now;
  link.bound_device_id = undefined;
  link.bound_at = undefined;
  link.reset_at = now;
  await writeLocalStore(store);
  return link;
}

export async function bindJulyGuestLink(input: {
  slug: string;
  token?: string;
  device_id: string;
}): Promise<
  | { ok: true; mode: "bound" | "already-bound"; link: JulyGuestLink }
  | { ok: false; mode: "token-mismatch" | "claimed"; link?: JulyGuestLink }
> {
  const d1 = await getD1();
  const now = new Date().toISOString();

  if (d1) {
    const link = await ensureD1Link(d1, input.slug);

    if (input.token && input.token !== link.token) {
      return { ok: false, mode: "token-mismatch", link };
    }

    if (link.bound_device_id && link.bound_device_id !== input.device_id) {
      return { ok: false, mode: "claimed", link };
    }

    if (link.bound_device_id === input.device_id) {
      return { ok: true, mode: "already-bound", link };
    }

    await d1
      .prepare(
        `update july2026_guest_links
         set bound_device_id = ?, bound_at = ?, updated_at = ?
         where slug = ? and bound_device_id is null`
      )
      .bind(input.device_id, now, now, input.slug)
      .run();

    return { ok: true, mode: "bound", link: await ensureD1Link(d1, input.slug) };
  }

  const store = await readLocalStore();
  const link = await ensureLocalLink(store, input.slug);

  if (input.token && input.token !== link.token) {
    return { ok: false, mode: "token-mismatch", link };
  }

  if (link.bound_device_id && link.bound_device_id !== input.device_id) {
    return { ok: false, mode: "claimed", link };
  }

  if (link.bound_device_id === input.device_id) {
    return { ok: true, mode: "already-bound", link };
  }

  link.bound_device_id = input.device_id;
  link.bound_at = now;
  link.updated_at = now;
  await writeLocalStore(store);
  return { ok: true, mode: "bound", link };
}
