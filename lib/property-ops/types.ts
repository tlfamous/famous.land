export const RENTAL_STATES = ["unconfigured", "private", "active", "paused"] as const;
export type RentalState = (typeof RENTAL_STATES)[number];

export const GUIDE_SECTION_TYPES = [
  "boundaries",
  "policies",
  "help",
  "wifi",
  "water",
  "waste",
  "food",
  "bathroom",
  "lake_safety",
  "fire_pit",
  "checkout"
] as const;
export type GuideSectionType = (typeof GUIDE_SECTION_TYPES)[number];

export const INVENTORY_CATEGORIES = [
  "homekit",
  "matter",
  "smart_lock",
  "network",
  "appliance",
  "safety",
  "other"
] as const;
export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export const INVENTORY_STATES = ["ok", "attention", "offline", "unknown"] as const;
export type InventoryState = (typeof INVENTORY_STATES)[number];

export const PURCHASE_CATEGORIES = [
  "linens",
  "furnishings",
  "supplies",
  "appliance",
  "maintenance",
  "utilities",
  "other"
] as const;
export type PurchaseCategory = (typeof PURCHASE_CATEGORIES)[number];

export const MEDIA_VISIBILITIES = ["private", "guide"] as const;
export type MediaVisibility = (typeof MEDIA_VISIBILITIES)[number];

export type Home = {
  id: string;
  lhCode: string;
  publicName: string;
  slug?: string;
  rentalState: RentalState;
  isPublic: boolean;
  timezone: string;
  address?: string;
  description?: string;
  privateNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type HomeSlugRedirect = {
  id: string;
  homeId: string;
  oldSlug: string;
  newSlug: string;
  createdBySessionId?: string;
  createdAt: string;
};

export type HomeSummary = Home & {
  lastPublishedAt?: string;
  lastGuideUpdatedAt?: string;
  wifiConfigured: boolean;
  locks: HomeLockDevice[];
};

export type LockState = "locked" | "unlocked" | "unknown";

export type HomeLockDevice = {
  id: string;
  homeId: string;
  seamDeviceId: string;
  connectedAccountId?: string;
  provider: string;
  displayName: string;
  model?: string;
  lockState: LockState;
  online: boolean;
  batteryLevel?: number;
  hasNativeEntryEvents: boolean;
  accessCodeCount: number;
  lastEventAt?: string;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type HomeLockEvent = {
  id: string;
  homeId: string;
  lockDeviceId: string;
  seamDeviceId: string;
  eventType: string;
  occurredAt: string;
  receivedAt: string;
  accessCodeId?: string;
  accessCodeName?: string;
  method?: string;
  description?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type HomeActivitySource = "seam" | "eero" | "mopeka" | "econet" | "system";
export type HomeActivityEvent = {
  id: string;
  homeId: string;
  source: HomeActivitySource;
  sourceEventId: string;
  eventType: string;
  occurredAt: string;
  receivedAt: string;
  deviceId?: string;
  deviceName?: string;
  description?: string;
  /** Non-sensitive display metadata only. Raw MAC/IP data is encrypted separately. */
  metadata?: Record<string, string | number | boolean | null>;
};

export type EeroIntegrationStatus = "unconfigured" | "verification_pending" | "connected" | "needs_reauthorization" | "error";
export type HomeNetworkIntegration = {
  id: string;
  homeId: string;
  provider: "eero";
  status: EeroIntegrationStatus;
  accountHint?: string;
  networkId?: string;
  networkName?: string;
  baselineEstablished: boolean;
  lastSyncedAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export type HomeIntegrationProvider = "mopeka" | "econet";
export type HomeIntegrationStatus =
  | "verification_pending"
  | "connected"
  | "needs_reauthorization"
  | "error";

export type HomeIntegration = {
  id: string;
  homeId: string;
  provider: HomeIntegrationProvider;
  status: HomeIntegrationStatus;
  accountHint?: string;
  externalDeviceId?: string;
  externalDeviceName?: string;
  externalLocationId?: string;
  externalLocationName?: string;
  metadata?: Record<string, string | number | boolean | null>;
  pollIntervalMinutes: number;
  consecutiveFailures: number;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  nextPollAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export type EquipmentMetricValue = string | number | boolean | null;

export type HomeEquipmentReading = {
  id: string;
  homeId: string;
  integrationId: string;
  provider: HomeIntegrationProvider;
  externalDeviceId: string;
  observedAt: string;
  sourceUpdatedAt?: string;
  online: boolean;
  metrics: Record<string, EquipmentMetricValue>;
  createdAt: string;
};

export type HomeAlertSeverity = "warning" | "critical";
export type HomeAlertStatus = "open" | "acknowledged" | "resolved";

export type HomeAlert = {
  id: string;
  homeId: string;
  integrationId: string;
  provider: HomeIntegrationProvider;
  deviceName: string;
  dedupeKey: string;
  alertType: string;
  severity: HomeAlertSeverity;
  status: HomeAlertStatus;
  title: string;
  description: string;
  openedAt: string;
  lastObservedAt: string;
  acknowledgedAt?: string;
  acknowledgedBySessionId?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioHomeAlert = HomeAlert & {
  homeName: string;
  homeCode: string;
};

export type DiscoveredHomeDevice = {
  id: string;
  name: string;
  locationId?: string;
  locationName?: string;
  metadata?: Record<string, EquipmentMetricValue>;
};

export type GuideSection = {
  id: string;
  homeId: string;
  sectionType: GuideSectionType;
  title: string;
  body: string;
  displayOrder: number;
  secretRef?: string;
  createdAt: string;
  updatedAt: string;
};

export type GuideSectionInput = {
  id?: string;
  sectionType: GuideSectionType;
  title: string;
  body: string;
  displayOrder: number;
  secretRef?: string;
};

export type PublishedGuideSection = Pick<
  GuideSection,
  "id" | "sectionType" | "title" | "body" | "displayOrder" | "secretRef"
>;

export type PublishedGuideMedia = {
  id: string;
  title: string;
  altText?: string;
};

export type PublishedGuideMediaReference = PublishedGuideMedia & {
  r2ObjectKey: string;
  mediaType: string;
};

export type GuideSnapshot = {
  publicName: string;
  slug: string;
  timezone: string;
  sections: PublishedGuideSection[];
  media: PublishedGuideMediaReference[];
  /** Immutable encrypted envelope captured at publish time; never plaintext JSON. */
  wifiSecret?: EncryptedHomeSecret;
};

export type PrintValidation = {
  pageCount: number;
  minimumFontPt: number;
  hasOverflow: boolean;
  checkedAt?: string;
};

export type GuidePublication = {
  id: string;
  homeId: string;
  snapshot: GuideSnapshot;
  contentHash: string;
  publishedAt: string;
  publishedBySessionId?: string;
  printValidation: PrintValidation;
};

export type PublishedHomeSlugChange = {
  home: Home;
  redirect: HomeSlugRedirect;
  publication: GuidePublication;
};

export type WifiCredentials = {
  network: string;
  password: string;
};

export type PublicGuideSection = Omit<PublishedGuideSection, "secretRef"> & {
  wifi?: WifiCredentials;
};

/** Deliberately narrow: no database ids, address, inventory, notes, or audit data. */
export type PublicGuide = {
  publicName: string;
  slug: string;
  timezone: string;
  publishedAt: string;
  contentHash: string;
  sections: PublicGuideSection[];
  media: PublishedGuideMedia[];
};

/** Server-only lookup result for the public media streaming route. */
export type PublishedGuideMediaAsset = {
  homeId: string;
  mediaId: string;
  objectKey: string;
  mediaType: string;
};

export type GuidePreview = {
  publicName: string;
  slug?: string;
  timezone: string;
  sections: PublicGuideSection[];
  media: PublishedGuideMedia[];
};

export type InventoryItem = {
  id: string;
  homeId: string;
  name: string;
  category: InventoryCategory;
  room?: string;
  make?: string;
  model?: string;
  serialNumber?: string;
  homekitEnabled: boolean;
  matterEnabled: boolean;
  airbnbManaged: boolean;
  manualId?: string;
  manualUrl?: string;
  operationalNotes?: string;
  state: InventoryState;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryItemInput = Omit<
  InventoryItem,
  "id" | "homeId" | "createdAt" | "updatedAt"
> & { id?: string };

/**
 * Private bookkeeping record for an Airbnb expense. Monetary amounts are
 * persisted in cents so CSV exports and tax totals stay exact.
 */
export type HomePurchase = {
  id: string;
  /** Optional: leave blank when an expense is shared across homes. */
  homeId?: string;
  itemName: string;
  description?: string;
  sku?: string;
  category: PurchaseCategory;
  vendorName: string;
  vendorUrl?: string;
  vendorOrderNumber?: string;
  receiptUrl?: string;
  purchaseDate: string;
  quantity: number;
  /** Undefined when the source record identifies the purchase but omits its price. */
  totalCents?: number;
  salesTaxCents?: number;
  shippingCents?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type HomePurchaseInput = Omit<
  HomePurchase,
  "id" | "createdAt" | "updatedAt"
> & { id?: string };

export type HomeManual = {
  id: string;
  homeId: string;
  title: string;
  sourceUrl?: string;
  r2ObjectKey?: string;
  fileName?: string;
  mediaType?: string;
  byteSize?: number;
  createdAt: string;
  updatedAt: string;
};

export type HomeManualInput = Omit<
  HomeManual,
  "id" | "homeId" | "createdAt" | "updatedAt"
> & { id?: string };

export type HomeMedia = {
  id: string;
  homeId: string;
  title: string;
  altText?: string;
  r2ObjectKey: string;
  fileName: string;
  mediaType: string;
  byteSize?: number;
  width?: number;
  height?: number;
  visibility: MediaVisibility;
  metadataStripped: true;
  processedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type HomeMediaInput = Omit<
  HomeMedia,
  "id" | "homeId" | "createdAt" | "updatedAt"
> & { id?: string };

export type HomeAuditEvent = {
  id: string;
  homeId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  adminSessionId?: string;
  detail?: Record<string, unknown>;
  createdAt: string;
};

/** Owner-only, manually captured Airbnb listing data. It is never exposed by public guide queries. */
export type AirbnbListingCapture = {
  id: string;
  homeId: string;
  listingId?: string;
  sourceUrl: string;
  listingTitle: string;
  location?: string;
  propertySummary?: string;
  description?: string;
  amenities: string[];
  pricingSummary?: string;
  availabilitySummary?: string;
  bookingSettings?: string;
  houseRules: string[];
  safetyFeatures: string[];
  cancellationPolicy?: string;
  customLink?: string;
  capturedAt: string;
  capturedBySessionId?: string;
};

export type AirbnbListingCaptureInput = Omit<
  AirbnbListingCapture,
  "id" | "homeId" | "capturedAt" | "capturedBySessionId"
>;

export type HomeManagementView = {
  home: Home;
  guideSections: GuideSection[];
  publishedGuide?: GuidePublication;
  media: HomeMedia[];
  airbnbCapture?: AirbnbListingCapture;
  proofDocumentUrl?: string;
  wifiConfigured: boolean;
  locks: HomeLockDevice[];
  lockEvents: HomeLockEvent[];
  activityEvents: HomeActivityEvent[];
  networkIntegration?: HomeNetworkIntegration;
  integrations: HomeIntegration[];
  equipmentReadings: HomeEquipmentReading[];
  alerts: HomeAlert[];
};

export type HomeUpdateInput = {
  publicName?: string;
  slug?: string | null;
  rentalState?: RentalState;
  timezone?: string;
  address?: string | null;
  description?: string | null;
  privateNotes?: string | null;
};

export type MutationContext = {
  adminSessionId?: string;
};

export type EncryptedHomeSecret = {
  ciphertext: string;
  iv: string;
  algorithm: "AES-GCM-256";
  keyVersion: 1;
};

export type StoredHomeSecret = EncryptedHomeSecret & {
  id: string;
  homeId: string;
  secretName: string;
  createdAt: string;
  updatedAt: string;
};

export type LocalHomesStore = {
  schemaVersion: 1;
  homes: Home[];
  /** Optional so existing schema-v1 local files remain readable. */
  slugRedirects?: HomeSlugRedirect[];
  guideSections: GuideSection[];
  publishedGuides: GuidePublication[];
  inventory: InventoryItem[];
  /** Optional so existing schema-v1 local files remain readable. */
  purchases?: HomePurchase[];
  manuals: HomeManual[];
  media: HomeMedia[];
  /** Optional so existing schema-v1 local files remain readable. */
  airbnbCaptures?: AirbnbListingCapture[];
  /** Optional so existing schema-v1 local files remain readable. */
  lockDevices?: HomeLockDevice[];
  /** Optional so existing schema-v1 local files remain readable. */
  lockEvents?: HomeLockEvent[];
  activityEvents?: HomeActivityEvent[];
  networkIntegrations?: HomeNetworkIntegration[];
  integrations?: HomeIntegration[];
  equipmentReadings?: HomeEquipmentReading[];
  alerts?: HomeAlert[];
  secrets: StoredHomeSecret[];
  auditEvents: HomeAuditEvent[];
};
