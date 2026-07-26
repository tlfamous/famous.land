const RESERVED_HOME_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "logout",
  "manage",
  "preview",
  "print",
  "qr",
  "qr-svg",
  "qr.svg",
  "settings",
  "sign-in",
  "signin",
  "stay"
]);

export function normalizeHomeSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isReservedHomeSlug(value: string): boolean {
  return RESERVED_HOME_SLUGS.has(normalizeHomeSlug(value));
}

export function assertValidHomeSlug(value: string): string {
  const slug = normalizeHomeSlug(value);

  if (slug.length < 3 || slug.length > 80) {
    throw new Error("A home slug must be between 3 and 80 characters.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("A home slug may contain only lowercase letters, numbers, and hyphens.");
  }

  if (RESERVED_HOME_SLUGS.has(slug)) {
    throw new Error(`The home slug \"${slug}\" is reserved.`);
  }

  return slug;
}

export function listReservedHomeSlugs(): string[] {
  return Array.from(RESERVED_HOME_SLUGS).sort();
}
