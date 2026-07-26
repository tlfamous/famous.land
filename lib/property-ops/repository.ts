import { decryptHomeSecretJson, encryptHomeSecretJson } from "./crypto";
import { assertValidHomeSlug } from "./slug";
import { listAllHomeLockDevices, listHomeLockDevices, listHomeLockEvents } from "./locks";
import {
  assertD1Success,
  getHomesD1,
  mutateLocalHomesStore,
  readLocalHomesStore,
  runD1AtomicBatch,
  runD1Batch,
  type HomesD1
} from "./storage";
import {
  type AirbnbListingCapture,
  type AirbnbListingCaptureInput,
  GUIDE_SECTION_TYPES,
  RENTAL_STATES,
  type GuidePublication,
  type GuidePreview,
  type GuideSection,
  type GuideSectionInput,
  type GuideSnapshot,
  type Home,
  type HomeAuditEvent,
  type HomeManagementView,
  type HomeSlugRedirect,
  type HomeSummary,
  type HomeUpdateInput,
  type LocalHomesStore,
  type MutationContext,
  type PrintValidation,
  type PublishedHomeSlugChange,
  type PublicGuide,
  type PublicGuideSection,
  type PublishedGuideMediaAsset,
  type StoredHomeSecret,
  type WifiCredentials
} from "./types";

type HomeRow = {
  id: string;
  lh_code: string;
  public_name: string;
  slug: string | null;
  rental_state: Home["rentalState"];
  is_public: number | boolean;
  timezone: string;
  address: string | null;
  description: string | null;
  private_notes: string | null;
  created_at: string;
  updated_at: string;
};

type GuideSectionRow = {
  id: string;
  home_id: string;
  section_type: GuideSection["sectionType"];
  title: string;
  body: string;
  display_order: number;
  secret_ref: string | null;
  created_at: string;
  updated_at: string;
};

type GuidePublicationRow = {
  id: string;
  home_id: string;
  snapshot_json: string;
  content_hash: string;
  published_at: string;
  published_by_session_id: string | null;
  print_page_count: number;
  print_minimum_font_pt: number;
  print_has_overflow: number | boolean;
};

type HomeSecretRow = {
  id: string;
  home_id: string;
  secret_name: string;
  ciphertext: string;
  iv: string;
  algorithm: "AES-GCM-256";
  key_version: 1;
  created_at: string;
  updated_at: string;
};

type HomeSlugRedirectRow = {
  id: string;
  home_id: string;
  old_slug: string;
  new_slug: string;
  created_by_session_id: string | null;
  created_at: string;
};

type AirbnbListingCaptureRow = {
  id: string;
  home_id: string;
  listing_id: string | null;
  source_url: string;
  snapshot_json: string;
  captured_at: string;
  captured_by_session_id: string | null;
};

type HomeSummaryRow = HomeRow & {
  last_published_at: string | null;
  last_guide_updated_at: string | null;
  wifi_configured: number | boolean;
};

// Some homes have no guest-facing water, fire-pit, or outdoor-shower instruction.
const REQUIRED_GUIDE_SECTION_TYPES = new Set(
  GUIDE_SECTION_TYPES.filter(
    (type) => type !== "water" && type !== "fire_pit" && type !== "bathroom"
  )
);
const WIFI_SECRET_NAME = "wifi_credentials";
const PROOF_DOCUMENT_SECRET_NAME = "proof_document";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function optionalText(value: string | null | undefined, maximum = 10_000): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, maximum) : undefined;
}

function requiredText(value: string, field: string, maximum = 10_000): string {
  const normalized = optionalText(value, maximum);
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}

function validateTimezone(value: string): string {
  const timezone = requiredText(value, "Timezone", 100);
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
  } catch {
    throw new Error("Timezone must be a valid IANA timezone.");
  }
  return timezone;
}

function homeFromRow(row: HomeRow): Home {
  return {
    id: row.id,
    lhCode: row.lh_code,
    publicName: row.public_name,
    slug: row.slug ?? undefined,
    rentalState: row.rental_state,
    isPublic: Boolean(row.is_public),
    timezone: row.timezone,
    address: row.address ?? undefined,
    description: row.description ?? undefined,
    privateNotes: row.private_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function guideSectionFromRow(row: GuideSectionRow): GuideSection {
  return {
    id: row.id,
    homeId: row.home_id,
    sectionType: row.section_type,
    title: row.title,
    body: row.body,
    displayOrder: Number(row.display_order),
    secretRef: row.secret_ref ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicationFromRow(row: GuidePublicationRow): GuidePublication {
  const snapshot = JSON.parse(row.snapshot_json) as GuideSnapshot;
  return {
    id: row.id,
    homeId: row.home_id,
    snapshot,
    contentHash: row.content_hash,
    publishedAt: row.published_at,
    publishedBySessionId: row.published_by_session_id ?? undefined,
    printValidation: {
      pageCount: Number(row.print_page_count),
      minimumFontPt: Number(row.print_minimum_font_pt),
      hasOverflow: Boolean(row.print_has_overflow)
    }
  };
}

function secretFromRow(row: HomeSecretRow): StoredHomeSecret {
  return {
    id: row.id,
    homeId: row.home_id,
    secretName: row.secret_name,
    ciphertext: row.ciphertext,
    iv: row.iv,
    algorithm: row.algorithm,
    keyVersion: Number(row.key_version) as 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function slugRedirectFromRow(row: HomeSlugRedirectRow): HomeSlugRedirect {
  return {
    id: row.id,
    homeId: row.home_id,
    oldSlug: row.old_slug,
    newSlug: row.new_slug,
    createdBySessionId: row.created_by_session_id ?? undefined,
    createdAt: row.created_at
  };
}

function airbnbCaptureFromRow(row: AirbnbListingCaptureRow): AirbnbListingCapture {
  const snapshot = JSON.parse(row.snapshot_json) as Omit<
    AirbnbListingCapture,
    "id" | "homeId" | "listingId" | "sourceUrl" | "capturedAt" | "capturedBySessionId"
  >;
  return {
    id: row.id,
    homeId: row.home_id,
    listingId: row.listing_id ?? undefined,
    sourceUrl: row.source_url,
    ...snapshot,
    capturedAt: row.captured_at,
    capturedBySessionId: row.captured_by_session_id ?? undefined
  };
}

function captureTextList(values: string[], field: string, maximum = 80): string[] {
  if (!Array.isArray(values)) throw new Error(`${field} must be a list.`);
  if (values.length > maximum) throw new Error(`${field} has too many items.`);
  return values
    .map((value) => requiredText(String(value), field, 300))
    .filter((value, index, all) => all.indexOf(value) === index);
}

function assertAirbnbCaptureIsSafe(value: string) {
  if (/\b(door\s*code|lock\s*code|alarm\s*code|security\s*code|access\s*code)\b/i.test(value)) {
    throw new Error("Airbnb captures must not contain door, lock, alarm, security, or access codes.");
  }
}

function normalizeAirbnbListingCapture(input: AirbnbListingCaptureInput): AirbnbListingCaptureInput {
  const sourceUrl = requiredText(input.sourceUrl, "Airbnb source URL", 2_000);
  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    throw new Error("Airbnb source URL must be a valid URL.");
  }
  if (parsed.protocol !== "https:" || !/(^|\.)airbnb\.com$/i.test(parsed.hostname)) {
    throw new Error("Airbnb source URL must be an HTTPS Airbnb URL.");
  }
  const normalized: AirbnbListingCaptureInput = {
    listingId: optionalText(input.listingId, 120),
    sourceUrl: parsed.toString(),
    listingTitle: requiredText(input.listingTitle, "Airbnb listing title", 300),
    location: optionalText(input.location, 500),
    propertySummary: optionalText(input.propertySummary, 1_000),
    description: optionalText(input.description, 10_000),
    amenities: captureTextList(input.amenities, "Amenities"),
    pricingSummary: optionalText(input.pricingSummary, 2_000),
    availabilitySummary: optionalText(input.availabilitySummary, 2_000),
    bookingSettings: optionalText(input.bookingSettings, 2_000),
    houseRules: captureTextList(input.houseRules, "House rules"),
    safetyFeatures: captureTextList(input.safetyFeatures, "Safety features"),
    cancellationPolicy: optionalText(input.cancellationPolicy, 500),
    customLink: optionalText(input.customLink, 2_000)
  };
  assertAirbnbCaptureIsSafe(JSON.stringify(normalized));
  return normalized;
}

async function d1Rows<T>(d1: HomesD1, query: string, values: unknown[] = []): Promise<T[]> {
  const result = await d1.prepare(query).bind(...values).all<T>();
  if (!result.success) throw new Error(result.error ?? "Homes database query failed.");
  return result.results ?? [];
}

async function d1Home(d1: HomesD1, homeId: string): Promise<Home | undefined> {
  const row = await d1.prepare("select * from homes where id = ?").bind(homeId).first<HomeRow>();
  return row ? homeFromRow(row) : undefined;
}

function localHome(store: LocalHomesStore, homeId: string): Home | undefined {
  return store.homes.find((home) => home.id === homeId);
}

async function assertHomeExists(homeId: string): Promise<Home> {
  const home = await getHome(homeId);
  if (!home) throw new Error("Home not found.");
  return home;
}

function makeAuditEvent(
  homeId: string | undefined,
  action: string,
  context: MutationContext,
  entityType?: string,
  entityId?: string,
  detail?: Record<string, unknown>
): HomeAuditEvent {
  return {
    id: crypto.randomUUID(),
    homeId,
    action,
    entityType,
    entityId,
    adminSessionId: context.adminSessionId,
    detail,
    createdAt: new Date().toISOString()
  };
}

function auditStatement(d1: HomesD1, event: HomeAuditEvent) {
  return d1
    .prepare(
      `insert into homes_audit_events (
         id, home_id, action, entity_type, entity_id, admin_session_id, detail_json, created_at
       ) values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      event.id,
      event.homeId ?? null,
      event.action,
      event.entityType ?? null,
      event.entityId ?? null,
      event.adminSessionId ?? null,
      event.detail ? JSON.stringify(event.detail) : null,
      event.createdAt
    );
}

export async function listHomes(): Promise<HomeSummary[]> {
  const locks = await listAllHomeLockDevices();
  const d1 = await getHomesD1();
  if (d1) {
    const rows = await d1Rows<HomeSummaryRow>(
      d1,
      `select homes.*,
         (select published_at from home_published_guides where home_id = homes.id)
           as last_published_at,
         (select max(updated_at) from home_guide_sections where home_id = homes.id)
           as last_guide_updated_at,
         exists(select 1 from home_secrets
            where home_id = homes.id and secret_name = 'wifi_credentials') as wifi_configured
       from homes
       order by lh_code asc`
    );

    return rows.map((row) => ({
      ...homeFromRow(row),
      lastPublishedAt: row.last_published_at ?? undefined,
      lastGuideUpdatedAt: row.last_guide_updated_at ?? undefined,
      wifiConfigured: Boolean(row.wifi_configured),
      locks: locks.filter((lock) => lock.homeId === row.id)
    }));
  }

  const store = await readLocalHomesStore();
  return store.homes
    .map((home) => {
      const publishedGuide = store.publishedGuides.find((item) => item.homeId === home.id);
      return {
        ...clone(home),
        lastPublishedAt: publishedGuide?.publishedAt,
        lastGuideUpdatedAt: store.guideSections
          .filter((section) => section.homeId === home.id)
          .map((section) => section.updatedAt)
          .sort()
          .at(-1),
        wifiConfigured: store.secrets.some(
          (secret) => secret.homeId === home.id && secret.secretName === WIFI_SECRET_NAME
        ),
        locks: locks.filter((lock) => lock.homeId === home.id)
      };
    })
    .sort((a, b) => a.lhCode.localeCompare(b.lhCode));
}

export async function getHome(homeId: string): Promise<Home | undefined> {
  const d1 = await getHomesD1();
  if (d1) return d1Home(d1, homeId);
  const store = await readLocalHomesStore();
  const home = localHome(store, homeId);
  return home ? clone(home) : undefined;
}

export async function getLatestAirbnbListingCapture(
  homeId: string
): Promise<AirbnbListingCapture | undefined> {
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare(
        `select * from home_airbnb_listing_captures
         where home_id = ? order by captured_at desc limit 1`
      )
      .bind(homeId)
      .first<AirbnbListingCaptureRow>();
    return row ? airbnbCaptureFromRow(row) : undefined;
  }
  const store = await readLocalHomesStore();
  const capture = (store.airbnbCaptures ?? [])
    .filter((item) => item.homeId === homeId)
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))[0];
  return capture ? clone(capture) : undefined;
}

export async function captureAirbnbListing(
  homeId: string,
  input: AirbnbListingCaptureInput,
  context: MutationContext = {}
): Promise<AirbnbListingCapture> {
  await assertHomeExists(homeId);
  const normalized = normalizeAirbnbListingCapture(input);
  const capture: AirbnbListingCapture = {
    id: crypto.randomUUID(),
    homeId,
    ...normalized,
    capturedAt: new Date().toISOString(),
    capturedBySessionId: context.adminSessionId
  };
  const d1 = await getHomesD1();
  if (d1) {
    await runD1Batch(d1, [
      d1
        .prepare(
          `insert into home_airbnb_listing_captures (
             id, home_id, listing_id, source_url, snapshot_json, captured_at, captured_by_session_id
           ) values (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          capture.id,
          capture.homeId,
          capture.listingId ?? null,
          capture.sourceUrl,
          JSON.stringify({
            listingTitle: capture.listingTitle,
            location: capture.location,
            propertySummary: capture.propertySummary,
            description: capture.description,
            amenities: capture.amenities,
            pricingSummary: capture.pricingSummary,
            availabilitySummary: capture.availabilitySummary,
            bookingSettings: capture.bookingSettings,
            houseRules: capture.houseRules,
            safetyFeatures: capture.safetyFeatures,
            cancellationPolicy: capture.cancellationPolicy,
            customLink: capture.customLink
          }),
          capture.capturedAt,
          capture.capturedBySessionId ?? null
        ),
      auditStatement(
        d1,
        makeAuditEvent(homeId, "airbnb.capture", context, "airbnb_listing_capture", capture.id, {
          listingId: capture.listingId,
          listingTitle: capture.listingTitle,
          sourceUrl: capture.sourceUrl
        })
      )
    ]);
    return capture;
  }
  return mutateLocalHomesStore((store) => {
    store.airbnbCaptures ??= [];
    store.airbnbCaptures.push(capture);
    store.auditEvents.push(
      makeAuditEvent(homeId, "airbnb.capture", context, "airbnb_listing_capture", capture.id, {
        listingId: capture.listingId,
        listingTitle: capture.listingTitle,
        sourceUrl: capture.sourceUrl
      })
    );
    return clone(capture);
  });
}

export async function updateHome(
  homeId: string,
  input: HomeUpdateInput,
  context: MutationContext = {}
): Promise<Home> {
  const current = await assertHomeExists(homeId);
  const nextSlug =
    input.slug === undefined
      ? current.slug
      : input.slug === null || !input.slug.trim()
        ? undefined
        : assertValidHomeSlug(input.slug);
  const next: Home = {
    ...current,
    publicName:
      input.publicName === undefined
        ? current.publicName
        : requiredText(input.publicName, "Public name", 120),
    slug: nextSlug,
    rentalState: input.rentalState ?? current.rentalState,
    timezone:
      input.timezone === undefined ? current.timezone : validateTimezone(input.timezone),
    address:
      input.address === undefined ? current.address : optionalText(input.address, 500),
    description:
      input.description === undefined
        ? current.description
        : optionalText(input.description, 2_000),
    privateNotes:
      input.privateNotes === undefined
        ? current.privateNotes
        : optionalText(input.privateNotes, 20_000),
    updatedAt: new Date().toISOString()
  };
  if (current.isPublic && next.rentalState !== "active") next.isPublic = false;

  if (!RENTAL_STATES.includes(next.rentalState)) throw new Error("Invalid rental state.");
  const implicitlyUnpublished = current.isPublic && !next.isPublic;

  const d1 = await getHomesD1();
  if (d1) {
    if (next.slug !== current.slug) {
      const publicationCount = await d1
        .prepare("select count(*) as count from home_published_guides where home_id = ?")
        .bind(homeId)
        .first<{ count: number }>();
      if (Number(publicationCount?.count ?? 0) > 0) {
        throw new Error("A home slug cannot change after its first publication.");
      }
      if (next.slug) {
        const collision = await d1
          .prepare(
            `select id from homes where slug = ? and id != ?
             union all
             select id from home_slug_redirects where old_slug = ?
             limit 1`
          )
          .bind(next.slug, homeId, next.slug)
          .first<{ id: string }>();
        if (collision) throw new Error("That home slug is already in use.");
      }
    }

    const event = makeAuditEvent(homeId, "home.update", context, "home", homeId, {
      changedFields: Object.keys(input)
    });
    await runD1Batch(d1, [
      d1
        .prepare(
          `update homes set public_name = ?, slug = ?, rental_state = ?, is_public = ?, timezone = ?,
             address = ?, description = ?, private_notes = ?, updated_at = ? where id = ?`
        )
        .bind(
          next.publicName,
          next.slug ?? null,
          next.rentalState,
          next.isPublic ? 1 : 0,
          next.timezone,
          next.address ?? null,
          next.description ?? null,
          next.privateNotes ?? null,
          next.updatedAt,
          homeId
        ),
      ...(implicitlyUnpublished
        ? [
            auditStatement(
              d1,
              makeAuditEvent(homeId, "guide.unpublish", context, "home", homeId, {
                reason: `rental_state:${next.rentalState}`
              })
            )
          ]
        : []),
      auditStatement(d1, event)
    ]);
    return (await d1Home(d1, homeId))!;
  }

  return mutateLocalHomesStore((store) => {
    const index = store.homes.findIndex((home) => home.id === homeId);
    if (index < 0) throw new Error("Home not found.");
    if (
      next.slug !== current.slug &&
      store.publishedGuides.some((publication) => publication.homeId === homeId)
    ) {
      throw new Error("A home slug cannot change after its first publication.");
    }
    if (
      next.slug &&
      (store.homes.some((home) => home.id !== homeId && home.slug === next.slug) ||
        (store.slugRedirects ?? []).some((redirect) => redirect.oldSlug === next.slug))
    ) {
      throw new Error("That home slug is already in use.");
    }
    store.homes[index] = next;
    if (implicitlyUnpublished) {
      store.auditEvents.push(
        makeAuditEvent(homeId, "guide.unpublish", context, "home", homeId, {
          reason: `rental_state:${next.rentalState}`
        })
      );
    }
    store.auditEvents.push(
      makeAuditEvent(homeId, "home.update", context, "home", homeId, {
        changedFields: Object.keys(input)
      })
    );
    return clone(next);
  });
}

/**
 * Exceptional, explicit replacement for a public URL that has already appeared
 * in a publication. Ordinary updateHome calls remain locked. This operation
 * permanently reserves the old slug, repoints all of this home's older redirects
 * to the new canonical slug, and replaces the current published snapshot so its
 * printed fallback URL and QR destination stay internally consistent.
 */
export async function changePublishedHomeSlug(
  homeId: string,
  newSlugValue: string,
  context: MutationContext = {}
): Promise<PublishedHomeSlugChange> {
  const newSlug = assertValidHomeSlug(newSlugValue);
  const d1 = await getHomesD1();

  if (d1) {
    const current = await d1Home(d1, homeId);
    if (!current) throw new Error("Home not found.");
    const oldSlug = current.slug;
    if (!oldSlug) throw new Error("The published home does not have a slug to preserve.");
    if (oldSlug === newSlug) throw new Error("The replacement slug must be different.");

    const collision = await d1
      .prepare(
        `select id from homes where slug = ?
         union all
         select id from home_slug_redirects where old_slug = ?
         limit 1`
      )
      .bind(newSlug, newSlug)
      .first<{ id: string }>();
    if (collision) throw new Error("That home slug is already in use.");

    const latest = await getPublishedGuide(homeId);
    if (!latest) {
      throw new Error("Use the normal home editor until the guide has been published once.");
    }

    const snapshot = normalizeSnapshot({ ...latest.snapshot, slug: newSlug });
    const hash = await contentHash(await renderedSnapshotContent(homeId, snapshot));
    const now = new Date().toISOString();
    const redirect: HomeSlugRedirect = {
      id: crypto.randomUUID(),
      homeId,
      oldSlug,
      newSlug,
      createdBySessionId: context.adminSessionId,
      createdAt: now
    };
    const publication: GuidePublication = {
      id: crypto.randomUUID(),
      homeId,
      snapshot,
      contentHash: hash,
      publishedAt: now,
      publishedBySessionId: context.adminSessionId,
      printValidation: clone(latest.printValidation)
    };

    try {
      await runD1AtomicBatch(d1, [
        d1
          .prepare(
            `insert into home_slug_redirects (
               id, home_id, old_slug, new_slug, created_by_session_id, created_at
             ) values (?, ?, ?, ?, ?, ?)`
          )
          .bind(
            redirect.id,
            homeId,
            oldSlug,
            newSlug,
            redirect.createdBySessionId ?? null,
            now
          ),
        d1
          .prepare("update home_slug_redirects set new_slug = ? where home_id = ?")
          .bind(newSlug, homeId),
        d1
          .prepare("update homes set slug = ?, updated_at = ? where id = ? and slug = ?")
          .bind(newSlug, now, homeId, oldSlug),
        publicationUpsertStatement(d1, publication),
        auditStatement(
          d1,
          makeAuditEvent(
            homeId,
            "home.slug.redirect",
            context,
            "home_slug_redirect",
            redirect.id,
            { oldSlug, newSlug }
          )
        ),
        auditStatement(
          d1,
          makeAuditEvent(
            homeId,
            "guide.publish.slug_change",
            context,
            "guide_publication",
            publication.id,
            {
              sourcePublicationId: latest.id,
              contentHash: hash
            }
          )
        )
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/unique|constraint|slug/i.test(message)) {
        throw new Error(
          "The home or slug changed while its permanent redirect was being saved. Please retry."
        );
      }
      throw error;
    }

    return {
      home: (await d1Home(d1, homeId))!,
      redirect,
      publication
    };
  }

  return mutateLocalHomesStore(async (store) => {
    const target = localHome(store, homeId);
    if (!target) throw new Error("Home not found.");
    const oldSlug = target.slug;
    if (!oldSlug) throw new Error("The published home does not have a slug to preserve.");
    if (oldSlug === newSlug) throw new Error("The replacement slug must be different.");
    if (
      store.homes.some((home) => home.slug === newSlug) ||
      (store.slugRedirects ?? []).some((redirect) => redirect.oldSlug === newSlug)
    ) {
      throw new Error("That home slug is already in use.");
    }

    const latest = store.publishedGuides.find((item) => item.homeId === homeId);
    if (!latest) {
      throw new Error("Use the normal home editor until the guide has been published once.");
    }

    const snapshot = normalizeSnapshot({ ...latest.snapshot, slug: newSlug });
    const hash = await contentHash(await renderedSnapshotContent(homeId, snapshot));
    const now = new Date().toISOString();
    const redirect: HomeSlugRedirect = {
      id: crypto.randomUUID(),
      homeId,
      oldSlug,
      newSlug,
      createdBySessionId: context.adminSessionId,
      createdAt: now
    };
    const publication: GuidePublication = {
      id: crypto.randomUUID(),
      homeId,
      snapshot,
      contentHash: hash,
      publishedAt: now,
      publishedBySessionId: context.adminSessionId,
      printValidation: clone(latest.printValidation)
    };

    store.slugRedirects ??= [];
    for (const previous of store.slugRedirects) {
      if (previous.homeId === homeId) previous.newSlug = newSlug;
    }
    store.slugRedirects.push(redirect);
    target.slug = newSlug;
    target.updatedAt = now;
    store.publishedGuides = store.publishedGuides.filter((item) => item.homeId !== homeId);
    store.publishedGuides.push(publication);
    store.auditEvents.push(
      makeAuditEvent(
        homeId,
        "home.slug.redirect",
        context,
        "home_slug_redirect",
        redirect.id,
        { oldSlug, newSlug }
      ),
      makeAuditEvent(
        homeId,
        "guide.publish.slug_change",
        context,
        "guide_publication",
        publication.id,
        {
          sourcePublicationId: latest.id,
          contentHash: hash
        }
      )
    );
    return { home: clone(target), redirect: clone(redirect), publication: clone(publication) };
  });
}

/** Resolve only retired slugs whose current target is still an active public guide. */
export async function resolvePublishedHomeSlugRedirect(
  slugValue: string
): Promise<string | undefined> {
  let oldSlug: string;
  try {
    oldSlug = assertValidHomeSlug(slugValue);
  } catch {
    return undefined;
  }

  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare(
        `select homes.slug as new_slug
         from home_slug_redirects redirect
         join homes on homes.id = redirect.home_id
         where redirect.old_slug = ?
           and redirect.new_slug = homes.slug
           and homes.is_public = 1
           and homes.rental_state = 'active'
           and exists (
             select 1 from home_published_guides publication
             where publication.home_id = homes.id
           )
         limit 1`
      )
      .bind(oldSlug)
      .first<{ new_slug: string }>();
    return row?.new_slug;
  }

  const store = await readLocalHomesStore();
  const redirect = (store.slugRedirects ?? []).find((item) => item.oldSlug === oldSlug);
  if (!redirect) return undefined;
  const target = store.homes.find(
    (home) =>
      home.id === redirect.homeId &&
      home.slug === redirect.newSlug &&
      home.isPublic &&
      home.rentalState === "active"
  );
  if (!target) return undefined;
  return store.publishedGuides.some((publication) => publication.homeId === target.id)
    ? redirect.newSlug
    : undefined;
}

export async function listGuideSections(homeId: string): Promise<GuideSection[]> {
  const d1 = await getHomesD1();
  if (d1) {
    return (
      await d1Rows<GuideSectionRow>(
        d1,
        "select * from home_guide_sections where home_id = ? order by display_order asc",
        [homeId]
      )
    ).map(guideSectionFromRow);
  }
  const store = await readLocalHomesStore();
  return store.guideSections
    .filter((section) => section.homeId === homeId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(clone);
}

function normalizeGuideSectionInput(
  homeId: string,
  input: GuideSectionInput,
  existing?: GuideSection
): GuideSection {
  if (!GUIDE_SECTION_TYPES.includes(input.sectionType)) {
    throw new Error("Invalid guide section type.");
  }
  const displayOrder = Number(input.displayOrder);
  if (!Number.isSafeInteger(displayOrder) || displayOrder < 0 || displayOrder > 100_000) {
    throw new Error("Guide display order must be a non-negative integer.");
  }
  const secretRef = optionalText(input.secretRef, 100);
  if (secretRef && (input.sectionType !== "wifi" || secretRef !== WIFI_SECRET_NAME)) {
    throw new Error("Only a Wi-Fi section may reference wifi_credentials.");
  }
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? input.id ?? crypto.randomUUID(),
    homeId,
    sectionType: input.sectionType,
    title: requiredText(input.title, "Section title", 120),
    body: requiredText(input.body, "Section body", 5_000),
    displayOrder,
    secretRef,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

function assertUniqueSectionOrders(sections: GuideSection[]): void {
  const orders = new Set<number>();
  const ids = new Set<string>();
  for (const section of sections) {
    if (orders.has(section.displayOrder)) throw new Error("Guide display orders must be unique.");
    if (ids.has(section.id)) throw new Error("Guide section ids must be unique.");
    orders.add(section.displayOrder);
    ids.add(section.id);
  }
}

function guideInsertStatement(d1: HomesD1, section: GuideSection) {
  return d1
    .prepare(
      `insert into home_guide_sections (
         id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
       ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      section.id,
      section.homeId,
      section.sectionType,
      section.title,
      section.body,
      section.displayOrder,
      section.secretRef ?? null,
      section.createdAt,
      section.updatedAt
    );
}

export async function replaceGuideSections(
  homeId: string,
  inputs: GuideSectionInput[],
  context: MutationContext = {}
): Promise<GuideSection[]> {
  await assertHomeExists(homeId);
  const existing = await listGuideSections(homeId);
  const existingById = new Map(existing.map((section) => [section.id, section]));
  const sections = inputs.map((input) =>
    normalizeGuideSectionInput(homeId, input, input.id ? existingById.get(input.id) : undefined)
  );
  assertUniqueSectionOrders(sections);

  const d1 = await getHomesD1();
  if (d1) {
    const event = makeAuditEvent(homeId, "guide.draft.replace", context, "guide", homeId, {
      sectionCount: sections.length
    });
    await runD1Batch(d1, [
      d1.prepare("delete from home_guide_sections where home_id = ?").bind(homeId),
      ...sections.map((section) => guideInsertStatement(d1, section)),
      d1.prepare("update homes set updated_at = ? where id = ?").bind(new Date().toISOString(), homeId),
      auditStatement(d1, event)
    ]);
    return listGuideSections(homeId);
  }

  return mutateLocalHomesStore((store) => {
    store.guideSections = [
      ...store.guideSections.filter((section) => section.homeId !== homeId),
      ...sections
    ];
    const home = localHome(store, homeId)!;
    home.updatedAt = new Date().toISOString();
    store.auditEvents.push(
      makeAuditEvent(homeId, "guide.draft.replace", context, "guide", homeId, {
        sectionCount: sections.length
      })
    );
    return sections.sort((a, b) => a.displayOrder - b.displayOrder).map(clone);
  });
}

export async function upsertGuideSection(
  homeId: string,
  input: GuideSectionInput,
  context: MutationContext = {}
): Promise<GuideSection> {
  await assertHomeExists(homeId);
  const existingSections = await listGuideSections(homeId);
  const existing = input.id
    ? existingSections.find((section) => section.id === input.id)
    : undefined;
  if (input.id && !existing) throw new Error("Guide section not found for this home.");
  const section = normalizeGuideSectionInput(homeId, input, existing);
  if (
    existingSections.some(
      (item) => item.id !== section.id && item.displayOrder === section.displayOrder
    )
  ) {
    throw new Error("Guide display orders must be unique.");
  }

  const d1 = await getHomesD1();
  if (d1) {
    const event = makeAuditEvent(homeId, "guide.section.upsert", context, "guide_section", section.id);
    await runD1Batch(d1, [
      d1
        .prepare(
          `insert into home_guide_sections (
             id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
           ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
           on conflict(id) do update set
             section_type = excluded.section_type, title = excluded.title, body = excluded.body,
             display_order = excluded.display_order, secret_ref = excluded.secret_ref,
             updated_at = excluded.updated_at`
        )
        .bind(
          section.id,
          section.homeId,
          section.sectionType,
          section.title,
          section.body,
          section.displayOrder,
          section.secretRef ?? null,
          section.createdAt,
          section.updatedAt
        ),
      auditStatement(d1, event)
    ]);
    return guideSectionFromRow(
      (await d1
        .prepare("select * from home_guide_sections where id = ?")
        .bind(section.id)
        .first<GuideSectionRow>())!
    );
  }

  return mutateLocalHomesStore((store) => {
    const index = store.guideSections.findIndex((item) => item.id === section.id);
    if (index >= 0) store.guideSections[index] = section;
    else store.guideSections.push(section);
    store.auditEvents.push(
      makeAuditEvent(homeId, "guide.section.upsert", context, "guide_section", section.id)
    );
    return clone(section);
  });
}

export async function deleteGuideSection(
  homeId: string,
  sectionId: string,
  context: MutationContext = {}
): Promise<void> {
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare("select id from home_guide_sections where id = ? and home_id = ?")
      .bind(sectionId, homeId)
      .first<{ id: string }>();
    if (!row) throw new Error("Guide section not found for this home.");
    await runD1Batch(d1, [
      d1.prepare("delete from home_guide_sections where id = ? and home_id = ?").bind(sectionId, homeId),
      auditStatement(
        d1,
        makeAuditEvent(homeId, "guide.section.delete", context, "guide_section", sectionId)
      )
    ]);
    return;
  }

  await mutateLocalHomesStore((store) => {
    const index = store.guideSections.findIndex(
      (section) => section.id === sectionId && section.homeId === homeId
    );
    if (index < 0) throw new Error("Guide section not found for this home.");
    store.guideSections.splice(index, 1);
    store.auditEvents.push(
      makeAuditEvent(homeId, "guide.section.delete", context, "guide_section", sectionId)
    );
  });
}

function normalizeSnapshot(value: unknown): GuideSnapshot {
  if (!value || typeof value !== "object") throw new Error("Invalid guide snapshot.");
  const candidate = value as Partial<GuideSnapshot>;
  const publicName = requiredText(candidate.publicName ?? "", "Snapshot public name", 120);
  const slug = assertValidHomeSlug(candidate.slug ?? "");
  const timezone = validateTimezone(candidate.timezone ?? "");
  if (!Array.isArray(candidate.sections)) throw new Error("Invalid guide snapshot sections.");
  const sections = candidate.sections.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid published guide section.");
    const section = raw as GuideSnapshot["sections"][number];
    if (!GUIDE_SECTION_TYPES.includes(section.sectionType)) {
      throw new Error("Invalid published guide section type.");
    }
    const displayOrder = Number(section.displayOrder);
    if (!Number.isSafeInteger(displayOrder) || displayOrder < 0 || displayOrder > 100_000) {
      throw new Error("Invalid published guide display order.");
    }
    return {
      id: requiredText(section.id, "Published section id", 200),
      sectionType: section.sectionType,
      title: requiredText(section.title, "Published section title", 120),
      body: requiredText(section.body, "Published section body", 5_000),
      displayOrder,
      secretRef:
        section.secretRef === WIFI_SECRET_NAME && section.sectionType === "wifi"
          ? WIFI_SECRET_NAME
          : undefined
    };
  });
  if (!Array.isArray(candidate.media)) throw new Error("Invalid guide snapshot media.");
  const media = candidate.media.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid published guide media.");
    const item = raw as GuideSnapshot["media"][number];
    return {
      id: requiredText(item.id, "Published media id", 200),
      title: requiredText(item.title, "Published media title", 200),
      altText: optionalText(item.altText, 500),
      r2ObjectKey: requiredText(item.r2ObjectKey, "Published media object key", 1_000),
      mediaType: requiredText(item.mediaType, "Published media type", 200)
    };
  });
  assertUniqueSectionOrders(
    sections.map((section) => ({
      ...section,
      homeId: "snapshot",
      createdAt: "",
      updatedAt: ""
    }))
  );
  const wifiSecret = candidate.wifiSecret;
  if (wifiSecret && (
    wifiSecret.algorithm !== "AES-GCM-256" ||
    wifiSecret.keyVersion !== 1 ||
    !wifiSecret.ciphertext ||
    !wifiSecret.iv
  )) throw new Error("Guide snapshot has an invalid encrypted Wi-Fi envelope.");
  return {
    publicName,
    slug,
    timezone,
    sections: sections.sort((a, b) => a.displayOrder - b.displayOrder),
    media,
    ...(wifiSecret ? {
      wifiSecret: {
        ciphertext: wifiSecret.ciphertext,
        iv: wifiSecret.iv,
        algorithm: "AES-GCM-256" as const,
        keyVersion: 1 as const
      }
    } : {})
  };
}

function publicationFromStoredRow(row: GuidePublicationRow): GuidePublication {
  return {
    ...publicationFromRow(row),
    snapshot: normalizeSnapshot(JSON.parse(row.snapshot_json) as unknown)
  };
}

export async function getPublishedGuide(homeId: string): Promise<GuidePublication | undefined> {
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare("select * from home_published_guides where home_id = ?")
      .bind(homeId)
      .first<GuidePublicationRow>();
    return row ? publicationFromStoredRow(row) : undefined;
  }
  const store = await readLocalHomesStore();
  const publication = store.publishedGuides.find((item) => item.homeId === homeId);
  return publication ? clone(publication) : undefined;
}

function validateWifiCredentials(credentials: WifiCredentials): WifiCredentials {
  return {
    network: requiredText(credentials.network, "Wi-Fi network", 128),
    password: requiredText(credentials.password, "Wi-Fi password", 256)
  };
}

async function getStoredWifiSecret(homeId: string): Promise<StoredHomeSecret | undefined> {
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare("select * from home_secrets where home_id = ? and secret_name = ?")
      .bind(homeId, WIFI_SECRET_NAME)
      .first<HomeSecretRow>();
    return row ? secretFromRow(row) : undefined;
  }
  const store = await readLocalHomesStore();
  const secret = store.secrets.find(
    (item) => item.homeId === homeId && item.secretName === WIFI_SECRET_NAME
  );
  return secret ? clone(secret) : undefined;
}

async function decryptWifiEnvelope(
  homeId: string,
  secret: Pick<StoredHomeSecret, "ciphertext" | "iv" | "algorithm" | "keyVersion">
): Promise<WifiCredentials> {
  return validateWifiCredentials(
    await decryptHomeSecretJson<WifiCredentials>(secret, `${homeId}:${WIFI_SECRET_NAME}`)
  );
}

export async function getWifiCredentials(homeId: string): Promise<WifiCredentials | undefined> {
  const secret = await getStoredWifiSecret(homeId);
  return secret ? decryptWifiEnvelope(homeId, secret) : undefined;
}

async function getStoredProofDocumentSecret(homeId: string): Promise<StoredHomeSecret | undefined> {
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare("select * from home_secrets where home_id = ? and secret_name = ?")
      .bind(homeId, PROOF_DOCUMENT_SECRET_NAME)
      .first<HomeSecretRow>();
    return row ? secretFromRow(row) : undefined;
  }
  const store = await readLocalHomesStore();
  const secret = store.secrets.find(
    (item) => item.homeId === homeId && item.secretName === PROOF_DOCUMENT_SECRET_NAME
  );
  return secret ? clone(secret) : undefined;
}

export async function getProofDocumentUrl(homeId: string): Promise<string | undefined> {
  const secret = await getStoredProofDocumentSecret(homeId);
  if (!secret) return undefined;
  const value = await decryptHomeSecretJson<{ url: string }>(
    secret,
    `${homeId}:${PROOF_DOCUMENT_SECRET_NAME}`
  );
  return typeof value.url === "string" ? value.url : undefined;
}

async function saveProofDocumentUrl(
  homeId: string,
  url: string,
  context: MutationContext
): Promise<void> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !/(^|\.)proofeditor\.ai$/i.test(parsed.hostname)) {
    throw new Error("Proof document URL must point to proofeditor.ai.");
  }
  const encrypted = await encryptHomeSecretJson({ url: parsed.toString() }, `${homeId}:${PROOF_DOCUMENT_SECRET_NAME}`);
  const now = new Date().toISOString();
  const d1 = await getHomesD1();
  if (d1) {
    const existing = await d1
      .prepare("select id, created_at from home_secrets where home_id = ? and secret_name = ?")
      .bind(homeId, PROOF_DOCUMENT_SECRET_NAME)
      .first<{ id: string; created_at: string }>();
    const id = existing?.id ?? crypto.randomUUID();
    await runD1Batch(d1, [
      d1.prepare(
        `insert into home_secrets (
          id, home_id, secret_name, ciphertext, iv, algorithm, key_version, created_at, updated_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
        on conflict(home_id, secret_name) do update set
          ciphertext = excluded.ciphertext, iv = excluded.iv, algorithm = excluded.algorithm,
          key_version = excluded.key_version, updated_at = excluded.updated_at`
      ).bind(
        id, homeId, PROOF_DOCUMENT_SECRET_NAME, encrypted.ciphertext, encrypted.iv,
        encrypted.algorithm, encrypted.keyVersion, existing?.created_at ?? now, now
      ),
      auditStatement(d1, makeAuditEvent(homeId, "proof.document.bind", context, "home_secret", id, {
        secretName: PROOF_DOCUMENT_SECRET_NAME
      }))
    ]);
    return;
  }
  await mutateLocalHomesStore((store) => {
    const index = store.secrets.findIndex(
      (item) => item.homeId === homeId && item.secretName === PROOF_DOCUMENT_SECRET_NAME
    );
    const next: StoredHomeSecret = {
      id: index >= 0 ? store.secrets[index].id : crypto.randomUUID(),
      homeId,
      secretName: PROOF_DOCUMENT_SECRET_NAME,
      ...encrypted,
      createdAt: index >= 0 ? store.secrets[index].createdAt : now,
      updatedAt: now
    };
    if (index >= 0) store.secrets[index] = next;
    else store.secrets.push(next);
    store.auditEvents.push(
      makeAuditEvent(homeId, "proof.document.bind", context, "home_secret", next.id, {
        secretName: PROOF_DOCUMENT_SECRET_NAME
      })
    );
  });
}

export async function createProofManualDocument(
  homeId: string,
  context: MutationContext = {}
): Promise<string> {
  const existing = await getProofDocumentUrl(homeId);
  if (existing) return existing;
  const home = await assertHomeExists(homeId);
  const sections = await listGuideSections(homeId);
  const body = sections
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((section) => `### ${section.title}\n\n${section.sectionType === "wifi" ? "Wi-Fi credentials are managed securely in Famous Land Homes." : section.body}`)
    .join("\n\n");
  const markdown = `# ${home.publicName} house manual\n\n## Front — instructions\n\n${body}\n\n## Back — FAQ\n\nUse concise answers for common guest questions. Keep Wi-Fi credentials, door codes, alarm codes, guest data, and reservations out of this document.`;
  const response = await fetch("https://www.proofeditor.ai/share/markdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: `${home.publicName} house manual`, markdown, by: "ai:codex" })
  });
  const payload = await response.json().catch(() => undefined) as { shareUrl?: string; tokenUrl?: string } | undefined;
  const url = payload?.tokenUrl ?? payload?.shareUrl;
  if (!response.ok || !url) throw new Error("Proof could not create the editing document.");
  await saveProofDocumentUrl(homeId, url, context);
  return url;
}

export async function setWifiCredentials(
  homeId: string,
  credentials: WifiCredentials,
  context: MutationContext = {}
): Promise<void> {
  await assertHomeExists(homeId);
  const value = validateWifiCredentials(credentials);
  const encrypted = await encryptHomeSecretJson(value, `${homeId}:${WIFI_SECRET_NAME}`);
  const now = new Date().toISOString();
  const d1 = await getHomesD1();
  if (d1) {
    const existing = await d1
      .prepare("select id, created_at from home_secrets where home_id = ? and secret_name = ?")
      .bind(homeId, WIFI_SECRET_NAME)
      .first<{ id: string; created_at: string }>();
    const id = existing?.id ?? crypto.randomUUID();
    await runD1Batch(d1, [
      d1
        .prepare(
          `insert into home_secrets (
             id, home_id, secret_name, ciphertext, iv, algorithm, key_version, created_at, updated_at
           ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
           on conflict(home_id, secret_name) do update set
             ciphertext = excluded.ciphertext, iv = excluded.iv,
             algorithm = excluded.algorithm, key_version = excluded.key_version,
             updated_at = excluded.updated_at`
        )
        .bind(
          id,
          homeId,
          WIFI_SECRET_NAME,
          encrypted.ciphertext,
          encrypted.iv,
          encrypted.algorithm,
          encrypted.keyVersion,
          existing?.created_at ?? now,
          now
        ),
      auditStatement(
        d1,
        makeAuditEvent(homeId, "secret.wifi.update", context, "home_secret", id, {
          secretName: WIFI_SECRET_NAME
        })
      )
    ]);
    return;
  }

  await mutateLocalHomesStore((store) => {
    const index = store.secrets.findIndex(
      (secret) => secret.homeId === homeId && secret.secretName === WIFI_SECRET_NAME
    );
    const next: StoredHomeSecret = {
      id: index >= 0 ? store.secrets[index].id : crypto.randomUUID(),
      homeId,
      secretName: WIFI_SECRET_NAME,
      ...encrypted,
      createdAt: index >= 0 ? store.secrets[index].createdAt : now,
      updatedAt: now
    };
    if (index >= 0) store.secrets[index] = next;
    else store.secrets.push(next);
    store.auditEvents.push(
      makeAuditEvent(homeId, "secret.wifi.update", context, "home_secret", next.id, {
        secretName: WIFI_SECRET_NAME
      })
    );
  });
}

export async function clearWifiCredentials(
  homeId: string,
  context: MutationContext = {}
): Promise<void> {
  const d1 = await getHomesD1();
  if (d1) {
    await runD1Batch(d1, [
      d1
        .prepare("delete from home_secrets where home_id = ? and secret_name = ?")
        .bind(homeId, WIFI_SECRET_NAME),
      auditStatement(
        d1,
        makeAuditEvent(homeId, "secret.wifi.clear", context, "home_secret", undefined, {
          secretName: WIFI_SECRET_NAME
        })
      )
    ]);
    return;
  }
  await mutateLocalHomesStore((store) => {
    store.secrets = store.secrets.filter(
      (secret) => !(secret.homeId === homeId && secret.secretName === WIFI_SECRET_NAME)
    );
    store.auditEvents.push(
      makeAuditEvent(homeId, "secret.wifi.clear", context, "home_secret", undefined, {
        secretName: WIFI_SECRET_NAME
      })
    );
  });
}

function assertPrintValidation(value: PrintValidation): PrintValidation {
  const validation = {
    pageCount: Number(value.pageCount),
    minimumFontPt: Number(value.minimumFontPt),
    hasOverflow: Boolean(value.hasOverflow),
    checkedAt: value.checkedAt
  };
  if (
    validation.pageCount !== 2 ||
    !Number.isFinite(validation.minimumFontPt) ||
    validation.minimumFontPt < 9 ||
    validation.hasOverflow
  ) {
    throw new Error(
      "Publication requires a two-sided Letter print check with no overflow and at least 9-point text."
    );
  }
  return validation;
}

function assertCompleteGuide(sections: GuideSection[] | GuideSnapshot["sections"]): void {
  const present = new Set(sections.map((section) => section.sectionType));
  for (const type of REQUIRED_GUIDE_SECTION_TYPES) {
    if (!present.has(type)) throw new Error(`The guide is missing its ${type} section.`);
  }
  if (sections.filter((section) => section.sectionType === "checkout").length < 2) {
    throw new Error("The guide needs separate checkout sections for towels and dishes.");
  }
  const wifiSections = sections.filter((section) => section.sectionType === "wifi");
  if (wifiSections.length !== 1) throw new Error("The guide needs exactly one Wi-Fi section.");
}

async function renderedSnapshotContent(
  homeId: string,
  snapshot: GuideSnapshot
): Promise<Omit<PublicGuide, "publishedAt" | "contentHash">> {
  const wifi = snapshot.wifiSecret
    ? await decryptWifiEnvelope(homeId, {
        ciphertext: snapshot.wifiSecret.ciphertext,
        iv: snapshot.wifiSecret.iv,
        algorithm: snapshot.wifiSecret.algorithm,
        keyVersion: snapshot.wifiSecret.keyVersion
      })
    : undefined;
  return {
    publicName: snapshot.publicName,
    slug: snapshot.slug,
    timezone: snapshot.timezone,
    media: snapshot.media.map((item) => ({
      id: item.id,
      title: item.title,
      altText: item.altText
    })),
    sections: snapshot.sections.map((section): PublicGuideSection => ({
      id: section.id,
      sectionType: section.sectionType,
      title: section.title,
      body: section.body,
      displayOrder: section.displayOrder,
      ...(section.secretRef === WIFI_SECRET_NAME && wifi ? { wifi } : {})
    }))
  };
}

async function listPublishedMedia(homeId: string): Promise<GuideSnapshot["media"]> {
  const d1 = await getHomesD1();
  if (d1) {
    return d1Rows<{
      id: string;
      title: string;
      alt_text: string | null;
      r2_object_key: string;
      media_type: string;
    }>(
      d1,
      `select id, title, alt_text, r2_object_key, media_type from home_media
       where home_id = ? and visibility = 'guide' and metadata_stripped = 1
       order by created_at asc`,
      [homeId]
    ).then((rows) =>
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        altText: row.alt_text ?? undefined,
        r2ObjectKey: row.r2_object_key,
        mediaType: row.media_type
      }))
    );
  }
  const store = await readLocalHomesStore();
  return store.media
    .filter(
      (item) =>
        item.homeId === homeId && item.visibility === "guide" && item.metadataStripped === true
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((item) => ({
      id: item.id,
      title: item.title,
      altText: item.altText,
      r2ObjectKey: item.r2ObjectKey,
      mediaType: item.mediaType
    }));
}

async function contentHash(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function assertPublicationAllowed(home: Home): Promise<StoredHomeSecret | undefined> {
  if (home.rentalState !== "active") {
    throw new Error("Only a home marked as an active rental can be published.");
  }
  if (!home.slug) throw new Error("Set a permanent public slug before publishing.");
  assertValidHomeSlug(home.slug);
  const wifiSecret = await getStoredWifiSecret(home.id);
  if (wifiSecret) await decryptWifiEnvelope(home.id, wifiSecret);

  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare("select count(*) as count from homes where is_public = 1 and id != ?")
      .bind(home.id)
      .first<{ count: number }>();
    if (Number(row?.count ?? 0) >= 2) throw new Error("Only two rental guides may be public.");
  } else {
    const store = await readLocalHomesStore();
    if (store.homes.filter((item) => item.id !== home.id && item.isPublic).length >= 2) {
      throw new Error("Only two rental guides may be public.");
    }
  }
  return wifiSecret;
}

export type PublishGuideInput = MutationContext & { printValidation: PrintValidation };

export async function publishGuide(
  homeId: string,
  input: PublishGuideInput
): Promise<GuidePublication> {
  const home = await assertHomeExists(homeId);
  const printValidation = assertPrintValidation(input.printValidation);
  const sections = await listGuideSections(homeId);
  assertCompleteGuide(sections);
  const wifiSecret = await assertPublicationAllowed(home);
  const media = await listPublishedMedia(homeId);
  const snapshot: GuideSnapshot = normalizeSnapshot({
    publicName: home.publicName,
    slug: home.slug,
    timezone: home.timezone,
    sections: sections.map((section) => ({
      id: section.id,
      sectionType: section.sectionType,
      title: section.title,
      body: section.body,
      displayOrder: section.displayOrder,
      secretRef: section.secretRef
    })),
    media,
    ...(wifiSecret ? {
      wifiSecret: {
        ciphertext: wifiSecret.ciphertext,
        iv: wifiSecret.iv,
        algorithm: wifiSecret.algorithm,
        keyVersion: wifiSecret.keyVersion
      }
    } : {})
  });
  const hash = await contentHash(await renderedSnapshotContent(homeId, snapshot));

  const d1 = await getHomesD1();
  if (d1) {
    const now = new Date().toISOString();
    const publicationId = crypto.randomUUID();
    const publication: GuidePublication = {
      id: publicationId,
      homeId,
      snapshot,
      contentHash: hash,
      publishedAt: now,
      publishedBySessionId: input.adminSessionId,
      printValidation
    };
    await runD1Batch(d1, [
      publicationUpsertStatement(d1, publication),
      d1.prepare("update homes set is_public = 1, updated_at = ? where id = ?").bind(now, homeId),
      auditStatement(
        d1,
        makeAuditEvent(homeId, "guide.publish", input, "published_guide", publicationId, {
          contentHash: hash
        })
      )
    ]);
    return (await getPublishedGuide(homeId))!;
  }

  return mutateLocalHomesStore((store) => {
    const target = localHome(store, homeId);
    if (!target) throw new Error("Home not found.");
    // Repeat the cardinality check inside the serialized local mutation.
    if (store.homes.filter((item) => item.id !== homeId && item.isPublic).length >= 2) {
      throw new Error("Only two rental guides may be public.");
    }
    const now = new Date().toISOString();
    const publicationId = crypto.randomUUID();
    const publication: GuidePublication = {
      id: publicationId,
      homeId,
      snapshot,
      contentHash: hash,
      publishedAt: now,
      publishedBySessionId: input.adminSessionId,
      printValidation
    };
    store.publishedGuides = store.publishedGuides.filter((item) => item.homeId !== homeId);
    store.publishedGuides.push(publication);
    target.isPublic = true;
    target.updatedAt = now;
    store.auditEvents.push(
      makeAuditEvent(homeId, "guide.publish", input, "published_guide", publicationId, {
        contentHash: hash
      })
    );
    return clone(publication);
  });
}

function publicationUpsertStatement(d1: HomesD1, publication: GuidePublication) {
  return d1
    .prepare(
      `insert into home_published_guides (
         id, home_id, snapshot_json, content_hash, published_at,
         published_by_session_id,
         print_page_count, print_minimum_font_pt, print_has_overflow
       ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
       on conflict(home_id) do update set
         id = excluded.id,
         snapshot_json = excluded.snapshot_json,
         content_hash = excluded.content_hash,
         published_at = excluded.published_at,
         published_by_session_id = excluded.published_by_session_id,
         print_page_count = excluded.print_page_count,
         print_minimum_font_pt = excluded.print_minimum_font_pt,
         print_has_overflow = excluded.print_has_overflow`
    )
    .bind(
      publication.id,
      publication.homeId,
      JSON.stringify(publication.snapshot),
      publication.contentHash,
      publication.publishedAt,
      publication.publishedBySessionId ?? null,
      publication.printValidation.pageCount,
      publication.printValidation.minimumFontPt,
      publication.printValidation.hasOverflow ? 1 : 0
    );
}

export async function unpublishGuide(
  homeId: string,
  context: MutationContext = {}
): Promise<Home> {
  const home = await assertHomeExists(homeId);
  if (!home.isPublic) return home;
  const now = new Date().toISOString();
  const d1 = await getHomesD1();
  if (d1) {
    await runD1Batch(d1, [
      d1.prepare("update homes set is_public = 0, updated_at = ? where id = ?").bind(now, homeId),
      auditStatement(d1, makeAuditEvent(homeId, "guide.unpublish", context, "home", homeId))
    ]);
    return (await d1Home(d1, homeId))!;
  }
  return mutateLocalHomesStore((store) => {
    const target = localHome(store, homeId);
    if (!target) throw new Error("Home not found.");
    target.isPublic = false;
    target.updatedAt = now;
    store.auditEvents.push(
      makeAuditEvent(homeId, "guide.unpublish", context, "home", homeId)
    );
    return clone(target);
  });
}

export async function getPublicGuideBySlug(slugValue: string): Promise<PublicGuide | undefined> {
  let slug: string;
  try {
    slug = assertValidHomeSlug(slugValue);
  } catch {
    return undefined;
  }
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare(
        `select publication.*, homes.id as resolved_home_id
         from homes
         join home_published_guides publication on publication.home_id = homes.id
         where homes.slug = ? and homes.is_public = 1 and homes.rental_state = 'active'
         limit 1`
      )
      .bind(slug)
      .first<GuidePublicationRow & { resolved_home_id: string }>();
    if (!row) return undefined;
    try {
      return await publicGuideFromPublication(row.resolved_home_id, publicationFromStoredRow(row));
    } catch {
      return undefined;
    }
  }

  const store = await readLocalHomesStore();
  const home = store.homes.find(
    (item) => item.slug === slug && item.isPublic && item.rentalState === "active"
  );
  if (!home) return undefined;
  const publication = store.publishedGuides.find((item) => item.homeId === home.id);
  if (!publication) return undefined;
  try {
    return await publicGuideFromPublication(home.id, publication);
  } catch {
    return undefined;
  }
}

export async function getPublishedGuideMediaBySlug(
  slugValue: string,
  mediaId: string
): Promise<PublishedGuideMediaAsset | undefined> {
  let slug: string;
  try {
    slug = assertValidHomeSlug(slugValue);
  } catch {
    return undefined;
  }
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1
      .prepare(
        `select publication.*, homes.id as resolved_home_id
         from homes
         join home_published_guides publication on publication.home_id = homes.id
         where homes.slug = ? and homes.is_public = 1 and homes.rental_state = 'active'
         limit 1`
      )
      .bind(slug)
      .first<GuidePublicationRow & { resolved_home_id: string }>();
    if (!row) return undefined;
    const publication = publicationFromStoredRow(row);
    await publicGuideFromPublication(row.resolved_home_id, publication);
    const media = publication.snapshot.media.find((item) => item.id === mediaId);
    return media
      ? {
          homeId: row.resolved_home_id,
          mediaId: media.id,
          objectKey: media.r2ObjectKey,
          mediaType: media.mediaType
        }
      : undefined;
  }
  const store = await readLocalHomesStore();
  const home = store.homes.find(
    (item) => item.slug === slug && item.isPublic && item.rentalState === "active"
  );
  if (!home) return undefined;
  const publication = store.publishedGuides.find((item) => item.homeId === home.id);
  if (publication) await publicGuideFromPublication(home.id, publication);
  const media = publication?.snapshot.media.find((item) => item.id === mediaId);
  return media
    ? {
        homeId: home.id,
        mediaId: media.id,
        objectKey: media.r2ObjectKey,
        mediaType: media.mediaType
      }
    : undefined;
}

async function publicGuideFromPublication(
  homeId: string,
  publication: GuidePublication
): Promise<PublicGuide> {
  const rendered = await renderedSnapshotContent(homeId, normalizeSnapshot(publication.snapshot));
  if ((await contentHash(rendered)) !== publication.contentHash) {
    throw new Error("Published guide content failed its integrity check.");
  }
  return {
    ...rendered,
    publishedAt: publication.publishedAt,
    contentHash: publication.contentHash
  };
}

export async function getGuidePreview(homeId: string): Promise<GuidePreview> {
  const home = await assertHomeExists(homeId);
  const sections = await listGuideSections(homeId);
  const wifi = await getWifiCredentials(homeId);
  const media = await listPublishedMedia(homeId);
  return {
    publicName: home.publicName,
    slug: home.slug,
    timezone: home.timezone,
    media,
    sections: sections.map((section) => ({
      id: section.id,
      sectionType: section.sectionType,
      title: section.title,
      body: section.body,
      displayOrder: section.displayOrder,
      ...(section.secretRef === WIFI_SECRET_NAME && wifi ? { wifi } : {})
    }))
  };
}

type AuditRow = {
  id: string;
  home_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  admin_session_id: string | null;
  detail_json: string | null;
  created_at: string;
};

export async function listHomeAuditEvents(homeId: string, limit = 100): Promise<HomeAuditEvent[]> {
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  const d1 = await getHomesD1();
  if (d1) {
    const rows = await d1Rows<AuditRow>(
      d1,
      "select * from homes_audit_events where home_id = ? order by created_at desc limit ?",
      [homeId, safeLimit]
    );
    return rows.map((row) => ({
      id: row.id,
      homeId: row.home_id ?? undefined,
      action: row.action,
      entityType: row.entity_type ?? undefined,
      entityId: row.entity_id ?? undefined,
      adminSessionId: row.admin_session_id ?? undefined,
      detail: row.detail_json ? (JSON.parse(row.detail_json) as Record<string, unknown>) : undefined,
      createdAt: row.created_at
    }));
  }
  const store = await readLocalHomesStore();
  return store.auditEvents
    .filter((event) => event.homeId === homeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, safeLimit)
    .map(clone);
}

export async function getHomeForManagement(homeId: string): Promise<HomeManagementView | undefined> {
  const home = await getHome(homeId);
  if (!home) return undefined;
  const { listHomeMedia } = await import("./assets");
  const { getHomeNetworkIntegration, listHomeActivityEvents } = await import("./activity");
  const {
    listCurrentHomeEquipmentReadings,
    listHomeAlerts,
    listHomeIntegrations
  } = await import("./equipment-monitoring");
  const [
    guideSections,
    publishedGuide,
    media,
    wifi,
    airbnbCapture,
    proofDocumentUrl,
    locks,
    lockEvents,
    activityEvents,
    networkIntegration,
    integrations,
    equipmentReadings,
    alerts
  ] = await Promise.all([
    listGuideSections(homeId),
    getPublishedGuide(homeId),
    listHomeMedia(homeId),
    getWifiCredentials(homeId),
    getLatestAirbnbListingCapture(homeId),
    getProofDocumentUrl(homeId),
    listHomeLockDevices(homeId),
    listHomeLockEvents(homeId, 200),
    listHomeActivityEvents(homeId, 300),
    getHomeNetworkIntegration(homeId),
    listHomeIntegrations(homeId),
    listCurrentHomeEquipmentReadings(homeId),
    listHomeAlerts(homeId)
  ]);
  return {
    home,
    guideSections,
    publishedGuide,
    media,
    airbnbCapture,
    proofDocumentUrl,
    wifiConfigured: Boolean(wifi),
    locks,
    lockEvents,
    activityEvents,
    networkIntegration,
    integrations,
    equipmentReadings,
    alerts
  };
}
