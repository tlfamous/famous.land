import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const productionCookieName = "__Host-famous_land_operator";
const developmentCookieName = "famous_land_operator";
const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;
const sessionLifetimeSeconds = sessionLifetimeMs / 1000;
const failureWindowMs = 15 * 60 * 1000;
const blockedWindowMs = 30 * 60 * 1000;
const attemptRetentionMs = 48 * 60 * 60 * 1000;
const maxFailures = 100;
const defaultAuthVersion = "1";

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

type RuntimeEnv = {
  DB?: FamousLandD1;
  famous_land_quest?: FamousLandD1;
  FAMOUS_LAND_ADMIN_PASSWORD?: string;
  FAMOUS_LAND_AUTH_VERSION?: string;
};

type AdminSessionRow = {
  id: string;
  token_hash: string;
  auth_version: string;
  created_at: string;
  expires_at: string;
  revoked_at?: string | null;
  last_seen_at: string;
};

type AdminLoginAttemptRow = {
  attempted_at: string;
  succeeded: number | boolean;
  blocked_until?: string | null;
};

type MemoryAuthStore = {
  sessions: AdminSessionRow[];
  attempts: Array<AdminLoginAttemptRow & { id: string; client_bucket: string }>;
};

type AuthBackend =
  | { kind: "d1"; d1: FamousLandD1 }
  | { kind: "memory"; store: MemoryAuthStore };

export type AdminSession = {
  id: string;
  createdAt: string;
  expiresAt: string;
  lastSeenAt: string;
};

export type AdminRequestAuthorization =
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse };

export type AdminSignInResult =
  | { ok: true; session: AdminSession; token: string }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "blocked"; retryAfterSeconds: number }
  | { ok: false; reason: "unavailable" };

export type TrustedAdminSignInResult =
  | { ok: true; session: AdminSession; token: string }
  | { ok: false; reason: "unavailable" };

const globalAuthStore = globalThis as typeof globalThis & {
  __famousLandAdminAuthStore?: MemoryAuthStore;
};

const memoryStore =
  globalAuthStore.__famousLandAdminAuthStore ??
  (globalAuthStore.__famousLandAdminAuthStore = { sessions: [], attempts: [] });

let schemaPromise: Promise<void> | undefined;

async function getRuntimeEnv(): Promise<RuntimeEnv | undefined> {
  try {
    const context = await getCloudflareContext({ async: true });
    return context.env as RuntimeEnv;
  } catch {
    return undefined;
  }
}

async function getAuthConfig() {
  const env = await getRuntimeEnv();

  return {
    authVersion:
      env?.FAMOUS_LAND_AUTH_VERSION ??
      process.env.FAMOUS_LAND_AUTH_VERSION ??
      defaultAuthVersion,
    password:
      env?.FAMOUS_LAND_ADMIN_PASSWORD ?? process.env.FAMOUS_LAND_ADMIN_PASSWORD
  };
}

async function ensureAuthSchema(d1: FamousLandD1) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await d1
        .prepare(
          `create table if not exists admin_sessions (
            id text primary key,
            token_hash text not null unique,
            auth_version text not null,
            created_at text not null,
            expires_at text not null,
            revoked_at text,
            last_seen_at text not null
          )`
        )
        .run();
      await d1
        .prepare(
          `create table if not exists admin_login_attempts (
            id text primary key,
            client_bucket text not null,
            attempted_at text not null,
            succeeded integer not null default 0,
            blocked_until text
          )`
        )
        .run();
      await d1
        .prepare(
          `create index if not exists admin_login_attempts_client_idx
           on admin_login_attempts (client_bucket, attempted_at desc)`
        )
        .run();
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }

  await schemaPromise;
}

async function getAuthBackend(): Promise<AuthBackend | undefined> {
  const env = await getRuntimeEnv();
  const d1 = env?.DB ?? env?.famous_land_quest;

  if (d1) {
    await ensureAuthSchema(d1);
    return { kind: "d1", d1 };
  }

  if (process.env.NODE_ENV !== "production") {
    return { kind: "memory", store: memoryStore };
  }

  return undefined;
}

function toAdminSession(row: AdminSessionRow): AdminSession {
  return {
    id: row.id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    lastSeenAt: row.last_seen_at
  };
}

function randomHex(byteCount: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteCount));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

async function constantTimeEqual(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([sha256Hex(left), sha256Hex(right)]);
  let difference = leftHash.length ^ rightHash.length;

  for (let index = 0; index < leftHash.length; index += 1) {
    difference |= leftHash.charCodeAt(index) ^ rightHash.charCodeAt(index);
  }

  return difference === 0;
}

function isProductionSecureRequest(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return forwardedProto === "https" || new URL(request.url).protocol === "https:";
}

function cookieNames() {
  return [productionCookieName, developmentCookieName] as const;
}

function cookieNameForRequest(request: Request) {
  return isProductionSecureRequest(request) ? productionCookieName : developmentCookieName;
}

function cookieValuesFromHeader(cookieHeader: string | null) {
  const values = new Map<string, string>();

  for (const pair of (cookieHeader ?? "").split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    if (name) values.set(name, value);
  }

  return cookieNames().flatMap((name) => {
    const value = values.get(name);
    return value ? [value] : [];
  });
}

async function sessionFromToken(token: string): Promise<AdminSession | undefined> {
  const backend = await getAuthBackend();
  if (!backend) return undefined;

  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const { authVersion } = await getAuthConfig();
  let row: AdminSessionRow | null | undefined;

  if (backend.kind === "d1") {
    row = await backend.d1
      .prepare("select * from admin_sessions where token_hash = ?")
      .bind(tokenHash)
      .first<AdminSessionRow>();
  } else {
    row = backend.store.sessions.find((session) => session.token_hash === tokenHash);
  }

  if (!row || row.revoked_at || row.auth_version !== authVersion) {
    return undefined;
  }

  const expiresAt = new Date(row.expires_at);
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= now) {
    return undefined;
  }

  const lastSeenAt = new Date(row.last_seen_at);
  if (!Number.isFinite(lastSeenAt.getTime()) || now.getTime() - lastSeenAt.getTime() > 5 * 60 * 1000) {
    const nextLastSeenAt = now.toISOString();
    row.last_seen_at = nextLastSeenAt;

    if (backend.kind === "d1") {
      await backend.d1
        .prepare("update admin_sessions set last_seen_at = ? where id = ?")
        .bind(nextLastSeenAt, row.id)
        .run();
    }
  }

  return toAdminSession(row);
}

async function firstValidSession(tokens: string[]) {
  for (const token of tokens) {
    try {
      const session = await sessionFromToken(token);
      if (session) return session;
    } catch (error) {
      console.error("Famous Land admin session validation failed", error);
      return undefined;
    }
  }

  return undefined;
}

async function getRequestSession(request: Request) {
  return firstValidSession(cookieValuesFromHeader(request.headers.get("cookie")));
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const tokens = cookieNames().flatMap((name) => {
    const token = cookieStore.get(name)?.value;
    return token ? [token] : [];
  });
  return firstValidSession(tokens);
}

export async function isAdminSignedIn() {
  return Boolean(await getAdminSession());
}

export async function getAdminSessionId() {
  return (await getAdminSession())?.id;
}

export function normalizeAdminNextPath(value: string | null | undefined, fallback = "/quest/admin") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const parsed = new URL(value, "https://famous.land");
    if (parsed.origin !== "https://famous.land") return fallback;

    const path = parsed.pathname;
    const allowed =
      path === "/quest/admin" ||
      path.startsWith("/quest/admin/") ||
      path === "/test" ||
      path.startsWith("/test/") ||
      path === "/maps" ||
      path.startsWith("/maps/") ||
      path === "/homes" ||
      path === "/homes/manage" ||
      path.startsWith("/homes/manage/") ||
      path === "/july2026/admin" ||
      path.startsWith("/july2026/admin/");

    if (!allowed || path.includes("/sign-in")) return fallback;
    return `${path}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export async function requireAdminPage(nextPath = "/quest/admin"): Promise<void> {
  if (await getAdminSession()) return;
  const safeNextPath = normalizeAdminNextPath(nextPath);
  redirect(`/sign-in?next=${encodeURIComponent(safeNextPath)}`);
}

export const requireAdmin = requireAdminPage;

export function adminRequiredJson() {
  return NextResponse.json(
    { ok: false, error: { code: "ADMIN_AUTH_REQUIRED", message: "Admin sign-on required." } },
    { status: 401, headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function requireAdminRequest(request: Request): Promise<NextResponse | null> {
  return (await getRequestSession(request)) ? null : adminRequiredJson();
}

function parsedOrigin(value: string | null) {
  if (!value || value === "null") return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function expectedOrigins(request: Request) {
  const origins = new Set<string>();
  origins.add(new URL(request.url).origin);

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    new URL(request.url).protocol.replace(":", "");

  if (host && (proto === "http" || proto === "https")) origins.add(`${proto}://${host}`);

  const configured = parsedOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? null);
  if (configured) origins.add(configured);
  return origins;
}

function requestSourceOrigin(request: Request) {
  return (
    parsedOrigin(request.headers.get("origin")) ?? parsedOrigin(request.headers.get("referer"))
  );
}

export function assertSameOrigin(request: Request): NextResponse | null {
  const sourceOrigin = requestSourceOrigin(request);

  if (sourceOrigin && expectedOrigins(request).has(sourceOrigin)) return null;

  return NextResponse.json(
    { ok: false, error: { code: "ORIGIN_MISMATCH", message: "Same-origin request required." } },
    { status: 403, headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function authorizeAdminRequest(
  request: Request,
  options: { mutation?: boolean } = {}
): Promise<AdminRequestAuthorization> {
  const session = await getRequestSession(request);
  if (!session) return { ok: false, response: adminRequiredJson() };

  if (options.mutation) {
    const denied = assertSameOrigin(request);
    if (denied) return { ok: false, response: denied };
  }

  return { ok: true, session };
}

function expectedOriginsFromHeaders(headerStore: Headers) {
  const origins = new Set<string>();
  const host =
    headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ?? headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto || (process.env.NODE_ENV === "production" ? "https" : "http");
  if (host) origins.add(`${proto}://${host}`);
  const configured = parsedOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? null);
  if (configured) origins.add(configured);
  return origins;
}

export async function requireAdminAction(nextPath = "/quest/admin") {
  const session = await getAdminSession();
  if (!session) {
    const safeNextPath = normalizeAdminNextPath(nextPath);
    redirect(`/sign-in?next=${encodeURIComponent(safeNextPath)}`);
  }

  const headerStore = await headers();
  const sourceOrigin =
    parsedOrigin(headerStore.get("origin")) ?? parsedOrigin(headerStore.get("referer"));

  if (!sourceOrigin || !expectedOriginsFromHeaders(headerStore).has(sourceOrigin)) {
    throw new Error("Same-origin admin action required.");
  }

  return session;
}

async function clientBucket(request: Request) {
  const client =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return (await sha256Hex(`admin-login:${client}`)).slice(0, 32);
}

async function recentAttempts(backend: AuthBackend, bucket: string, now: Date) {
  const cutoff = new Date(now.getTime() - blockedWindowMs - failureWindowMs).toISOString();

  if (backend.kind === "d1") {
    const result = await backend.d1
      .prepare(
        `select attempted_at, succeeded, blocked_until
         from admin_login_attempts
         where client_bucket = ? and attempted_at >= ?
         order by attempted_at desc
         limit 100`
      )
      .bind(bucket, cutoff)
      .all<AdminLoginAttemptRow>();
    return result.results ?? [];
  }

  return backend.store.attempts
    .filter((attempt) => attempt.client_bucket === bucket && attempt.attempted_at >= cutoff)
    .sort((left, right) => right.attempted_at.localeCompare(left.attempted_at));
}

function currentBlock(attempts: AdminLoginAttemptRow[], now: Date) {
  const blockedUntil = attempts
    .map((attempt) => attempt.blocked_until)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  if (!blockedUntil) return undefined;
  const blockedUntilTime = new Date(blockedUntil).getTime();
  if (!Number.isFinite(blockedUntilTime) || blockedUntilTime <= now.getTime()) return undefined;
  return Math.max(1, Math.ceil((blockedUntilTime - now.getTime()) / 1000));
}

function currentFailureCount(attempts: AdminLoginAttemptRow[], now: Date) {
  const cutoff = now.getTime() - failureWindowMs;
  const latestSuccess = attempts.find((attempt) => Boolean(attempt.succeeded))?.attempted_at;

  return attempts.filter((attempt) => {
    if (Boolean(attempt.succeeded)) return false;
    const time = new Date(attempt.attempted_at).getTime();
    return time >= cutoff && (!latestSuccess || attempt.attempted_at > latestSuccess);
  }).length;
}

async function recordAttempt(
  backend: AuthBackend,
  bucket: string,
  succeeded: boolean,
  blockedUntil?: string
) {
  const row = {
    id: crypto.randomUUID(),
    client_bucket: bucket,
    attempted_at: new Date().toISOString(),
    succeeded,
    blocked_until: blockedUntil
  };

  if (backend.kind === "d1") {
    await backend.d1
      .prepare(
        `insert into admin_login_attempts
           (id, client_bucket, attempted_at, succeeded, blocked_until)
         values (?, ?, ?, ?, ?)`
      )
      .bind(row.id, bucket, row.attempted_at, succeeded ? 1 : 0, blockedUntil ?? null)
      .run();
    await backend.d1
      .prepare("delete from admin_login_attempts where attempted_at < ?")
      .bind(new Date(Date.now() - attemptRetentionMs).toISOString())
      .run();
    return;
  }

  backend.store.attempts.push(row);
  backend.store.attempts = backend.store.attempts.filter(
    (attempt) => attempt.attempted_at >= new Date(Date.now() - attemptRetentionMs).toISOString()
  );
}

async function createSession(backend: AuthBackend, authVersion: string) {
  const now = new Date();
  const token = randomHex(32);
  const row: AdminSessionRow = {
    id: crypto.randomUUID(),
    token_hash: await sha256Hex(token),
    auth_version: authVersion,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + sessionLifetimeMs).toISOString(),
    revoked_at: null,
    last_seen_at: now.toISOString()
  };

  if (backend.kind === "d1") {
    await backend.d1
      .prepare(
        `insert into admin_sessions
           (id, token_hash, auth_version, created_at, expires_at, revoked_at, last_seen_at)
         values (?, ?, ?, ?, ?, null, ?)`
      )
      .bind(
        row.id,
        row.token_hash,
        row.auth_version,
        row.created_at,
        row.expires_at,
        row.last_seen_at
      )
      .run();
  } else {
    backend.store.sessions.push(row);
  }

  return { session: toAdminSession(row), token };
}

export async function createTrustedAdminSession(): Promise<TrustedAdminSignInResult> {
  try {
    const backend = await getAuthBackend();
    const { authVersion } = await getAuthConfig();
    if (!backend) return { ok: false, reason: "unavailable" };

    const created = await createSession(backend, authVersion);
    return { ok: true, ...created };
  } catch (error) {
    console.error("Famous Land trusted admin sign-in failed", error);
    return { ok: false, reason: "unavailable" };
  }
}

export async function signInAdmin(request: Request, suppliedPassword: string): Promise<AdminSignInResult> {
  try {
    const backend = await getAuthBackend();
    const config = await getAuthConfig();
    if (!backend || !config.password) return { ok: false, reason: "unavailable" };

    const bucket = await clientBucket(request);
    const now = new Date();
    const attempts = await recentAttempts(backend, bucket, now);
    const retryAfterSeconds = currentBlock(attempts, now);
    if (retryAfterSeconds) return { ok: false, reason: "blocked", retryAfterSeconds };

    if (!(await constantTimeEqual(suppliedPassword, config.password))) {
      const failureCount = currentFailureCount(attempts, now) + 1;
      const blockedUntil =
        failureCount >= maxFailures
          ? new Date(now.getTime() + blockedWindowMs).toISOString()
          : undefined;
      await recordAttempt(backend, bucket, false, blockedUntil);

      if (blockedUntil) {
        return {
          ok: false,
          reason: "blocked",
          retryAfterSeconds: Math.ceil(blockedWindowMs / 1000)
        };
      }

      return { ok: false, reason: "invalid" };
    }

    await recordAttempt(backend, bucket, true);
    const created = await createSession(backend, config.authVersion);
    return { ok: true, ...created };
  } catch (error) {
    console.error("Famous Land admin sign-in failed", error);
    return { ok: false, reason: "unavailable" };
  }
}

export function attachAdminSessionCookie(response: NextResponse, request: Request, token: string) {
  const secure = isProductionSecureRequest(request);
  const name = cookieNameForRequest(request);
  response.cookies.set({
    name,
    value: token,
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: sessionLifetimeSeconds
  });
}

export function clearAdminSessionCookies(response: NextResponse, request: Request) {
  const secure = isProductionSecureRequest(request);

  for (const name of cookieNames()) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      secure: name === productionCookieName ? true : secure,
      sameSite: "lax",
      path: "/",
      maxAge: 0
    });
  }
}

export async function revokeAdminRequestSession(request: Request) {
  const tokens = cookieValuesFromHeader(request.headers.get("cookie"));
  if (!tokens.length) return;

  try {
    const backend = await getAuthBackend();
    if (!backend) return;
    const hashes = await Promise.all(tokens.map(sha256Hex));
    const now = new Date().toISOString();

    if (backend.kind === "d1") {
      for (const hash of hashes) {
        await backend.d1
          .prepare("update admin_sessions set revoked_at = ? where token_hash = ?")
          .bind(now, hash)
          .run();
      }
    } else {
      for (const session of backend.store.sessions) {
        if (hashes.includes(session.token_hash)) session.revoked_at = now;
      }
    }
  } catch (error) {
    console.error("Famous Land admin logout failed", error);
  }
}
