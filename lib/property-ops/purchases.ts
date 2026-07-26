import { getHome } from "./repository";
import {
  getHomesD1,
  mutateLocalHomesStore,
  readLocalHomesStore,
  runD1Batch,
  type HomesD1
} from "./storage";
import {
  PURCHASE_CATEGORIES,
  type HomeAuditEvent,
  type HomePurchase,
  type HomePurchaseInput,
  type MutationContext
} from "./types";

export type PurchaseImportResult = {
  created: HomePurchase[];
  skippedDuplicates: number;
};

type PurchaseRow = {
  id: string;
  home_id: string | null;
  item_name: string;
  description: string | null;
  sku: string | null;
  category: HomePurchase["category"];
  vendor_name: string;
  vendor_url: string | null;
  vendor_order_number: string | null;
  receipt_url: string | null;
  purchase_date: string;
  quantity: number;
  total_cents: number | null;
  sales_tax_cents: number | null;
  shipping_cents: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function optionalText(value: string | undefined, maximum: number): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, maximum) : undefined;
}

function requiredText(value: string | undefined, field: string, maximum: number): string {
  const normalized = optionalText(value, maximum);
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}

function optionalHttpUrl(value: string | undefined, field: string): string | undefined {
  const normalized = optionalText(value, 2_000);
  if (!normalized) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(`${field} must be an absolute HTTP(S) URL.`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${field} must be an absolute HTTP(S) URL.`);
  }
  return parsed.toString();
}

function requiredPurchaseDate(value: string | undefined): string {
  const date = requiredText(value, "Purchase date", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Purchase date must use YYYY-MM-DD.");
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("Purchase date is invalid.");
  }
  return date;
}

function requiredPositiveInteger(value: number, field: string, maximum: number): number {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${field} must be a whole number between 1 and ${maximum.toLocaleString("en-US")}.`);
  }
  return value;
}

function requiredCents(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 0 || value > 100_000_000) {
    throw new Error(`${field} must be a whole-number amount in cents.`);
  }
  return value;
}

function optionalCents(value: number | undefined, field: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  return requiredCents(value, field);
}

function purchaseFromRow(row: PurchaseRow): HomePurchase {
  return {
    id: row.id,
    ...(row.home_id ? { homeId: row.home_id } : {}),
    itemName: row.item_name,
    category: row.category,
    vendorName: row.vendor_name,
    purchaseDate: row.purchase_date,
    quantity: Number(row.quantity),
    ...(row.total_cents === null ? {} : { totalCents: Number(row.total_cents) }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.description ? { description: row.description } : {}),
    ...(row.sku ? { sku: row.sku } : {}),
    ...(row.vendor_url ? { vendorUrl: row.vendor_url } : {}),
    ...(row.vendor_order_number ? { vendorOrderNumber: row.vendor_order_number } : {}),
    ...(row.receipt_url ? { receiptUrl: row.receipt_url } : {}),
    ...(row.sales_tax_cents === null ? {} : { salesTaxCents: Number(row.sales_tax_cents) }),
    ...(row.shipping_cents === null ? {} : { shippingCents: Number(row.shipping_cents) }),
    ...(row.notes ? { notes: row.notes } : {})
  };
}

function auditEvent(
  purchase: HomePurchase,
  action: string,
  context: MutationContext
): HomeAuditEvent {
  return {
    id: crypto.randomUUID(),
    homeId: purchase.homeId,
    action,
    entityType: "home_purchase",
    entityId: purchase.id,
    adminSessionId: context.adminSessionId,
    detail: { purchaseDate: purchase.purchaseDate, totalCents: purchase.totalCents },
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

function normalizePurchase(input: HomePurchaseInput, existing?: HomePurchase): HomePurchase {
  if (!PURCHASE_CATEGORIES.includes(input.category)) throw new Error("Invalid purchase category.");
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? input.id ?? crypto.randomUUID(),
    homeId: optionalText(input.homeId, 200),
    itemName: requiredText(input.itemName, "Item name", 200),
    description: optionalText(input.description, 10_000),
    sku: optionalText(input.sku, 500),
    category: input.category,
    vendorName: requiredText(input.vendorName, "Vendor", 200),
    vendorUrl: optionalHttpUrl(input.vendorUrl, "Vendor link"),
    vendorOrderNumber: optionalText(input.vendorOrderNumber, 500),
    receiptUrl: optionalHttpUrl(input.receiptUrl, "Receipt link"),
    purchaseDate: requiredPurchaseDate(input.purchaseDate),
    quantity: requiredPositiveInteger(input.quantity, "Quantity", 100_000),
    totalCents: optionalCents(input.totalCents, "Total paid"),
    salesTaxCents: optionalCents(input.salesTaxCents, "Sales tax"),
    shippingCents: optionalCents(input.shippingCents, "Shipping"),
    notes: optionalText(input.notes, 10_000),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

export async function listHomePurchases(homeId?: string): Promise<HomePurchase[]> {
  const d1 = await getHomesD1();
  if (d1) {
    const statement = homeId
      ? d1.prepare("select * from home_purchases where home_id = ? order by purchase_date desc, created_at desc").bind(homeId)
      : d1.prepare("select * from home_purchases order by purchase_date desc, created_at desc");
    const result = await statement.all<PurchaseRow>();
    if (!result.success) throw new Error(result.error ?? "Purchase query failed.");
    return (result.results ?? []).map(purchaseFromRow);
  }
  const store = await readLocalHomesStore();
  return (store.purchases ?? [])
    .filter((purchase) => !homeId || purchase.homeId === homeId)
    .sort((left, right) => right.purchaseDate.localeCompare(left.purchaseDate) || right.createdAt.localeCompare(left.createdAt))
    .map((purchase) => structuredClone(purchase));
}

export async function getHomePurchase(id: string): Promise<HomePurchase | undefined> {
  const d1 = await getHomesD1();
  if (d1) {
    const row = await d1.prepare("select * from home_purchases where id = ?").bind(id).first<PurchaseRow>();
    return row ? purchaseFromRow(row) : undefined;
  }
  const store = await readLocalHomesStore();
  const purchase = (store.purchases ?? []).find((candidate) => candidate.id === id);
  return purchase ? structuredClone(purchase) : undefined;
}

export async function upsertHomePurchase(
  input: HomePurchaseInput,
  context: MutationContext = {}
): Promise<HomePurchase> {
  const existing = input.id ? await getHomePurchase(input.id) : undefined;
  const purchase = normalizePurchase(input, existing);
  if (purchase.homeId && !(await getHome(purchase.homeId))) throw new Error("Property not found.");

  const d1 = await getHomesD1();
  if (d1) {
    const event = auditEvent(purchase, "purchase.upsert", context);
    await runD1Batch(d1, [
      d1
        .prepare(
          `insert into home_purchases (
             id, home_id, item_name, description, sku, category, vendor_name, vendor_url,
             vendor_order_number, receipt_url, purchase_date, quantity, total_cents,
             sales_tax_cents, shipping_cents, notes, created_at, updated_at
           ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           on conflict(id) do update set
             home_id = excluded.home_id, item_name = excluded.item_name,
             description = excluded.description, sku = excluded.sku, category = excluded.category,
             vendor_name = excluded.vendor_name, vendor_url = excluded.vendor_url,
             vendor_order_number = excluded.vendor_order_number, receipt_url = excluded.receipt_url,
             purchase_date = excluded.purchase_date, quantity = excluded.quantity,
             total_cents = excluded.total_cents, sales_tax_cents = excluded.sales_tax_cents,
             shipping_cents = excluded.shipping_cents, notes = excluded.notes,
             updated_at = excluded.updated_at`
        )
        .bind(
          purchase.id,
          purchase.homeId,
          purchase.itemName,
          purchase.description ?? null,
          purchase.sku ?? null,
          purchase.category,
          purchase.vendorName,
          purchase.vendorUrl ?? null,
          purchase.vendorOrderNumber ?? null,
          purchase.receiptUrl ?? null,
          purchase.purchaseDate,
          purchase.quantity,
          purchase.totalCents ?? null,
          purchase.salesTaxCents ?? null,
          purchase.shippingCents ?? null,
          purchase.notes ?? null,
          purchase.createdAt,
          purchase.updatedAt
        ),
      auditStatement(d1, event)
    ]);
    return (await getHomePurchase(purchase.id))!;
  }

  return mutateLocalHomesStore((store) => {
    const purchases = store.purchases ?? (store.purchases = []);
    const index = purchases.findIndex((candidate) => candidate.id === purchase.id);
    if (index >= 0) purchases[index] = purchase;
    else purchases.push(purchase);
    store.auditEvents.push(auditEvent(purchase, "purchase.upsert", context));
    return structuredClone(purchase);
  });
}

/**
 * Imports reviewed vendor rows while keeping the ledger idempotent.  A vendor
 * receipt can contain multiple products, so an item is only considered a
 * duplicate when its vendor, receipt number, date, and item name all match.
 */
export async function importHomePurchases(
  inputs: HomePurchaseInput[],
  context: MutationContext = {}
): Promise<PurchaseImportResult> {
  if (inputs.length === 0) throw new Error("Select at least one purchase to import.");
  if (inputs.length > 500) throw new Error("Import up to 500 purchases at a time.");

  const existing = await listHomePurchases();
  const keys = new Set(existing.map(purchaseImportKey));
  const created: HomePurchase[] = [];
  let skippedDuplicates = 0;

  for (const input of inputs) {
    const candidateKey = purchaseImportKey(input);
    if (keys.has(candidateKey)) {
      skippedDuplicates += 1;
      continue;
    }
    const purchase = await upsertHomePurchase(input, context);
    keys.add(candidateKey);
    created.push(purchase);
  }
  return { created, skippedDuplicates };
}

function purchaseImportKey(purchase: Pick<HomePurchaseInput, "vendorName" | "vendorOrderNumber" | "purchaseDate" | "itemName">): string {
  return [
    purchase.vendorName.trim().toLocaleLowerCase("en-US"),
    (purchase.vendorOrderNumber || "").trim().toLocaleLowerCase("en-US"),
    purchase.purchaseDate,
    purchase.itemName.trim().toLocaleLowerCase("en-US")
  ].join("|");
}

export async function deleteHomePurchase(
  id: string,
  context: MutationContext = {}
): Promise<void> {
  const purchase = await getHomePurchase(id);
  if (!purchase) throw new Error("Purchase not found.");
  const event = auditEvent(purchase, "purchase.delete", context);
  const d1 = await getHomesD1();
  if (d1) {
    await runD1Batch(d1, [
      d1.prepare("delete from home_purchases where id = ?").bind(id),
      auditStatement(d1, event)
    ]);
    return;
  }
  await mutateLocalHomesStore((store) => {
    store.purchases = (store.purchases ?? []).filter((candidate) => candidate.id !== id);
    store.auditEvents.push(event);
  });
}
