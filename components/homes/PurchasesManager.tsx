"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  HomePurchase,
  HomePurchaseInput,
  HomeSummary,
  PurchaseCategory
} from "@/lib/property-ops";
import styles from "./homes.module.css";

type ApiResult<T> = {
  ok?: boolean;
  data?: T;
  error?: { message?: string };
};

type ImportResult = {
  created: HomePurchase[];
  skippedDuplicates: number;
};

type HomeDepotImportRow = {
  id: string;
  purchase: HomePurchaseInput;
  duplicate: boolean;
};

const purchaseCategories: PurchaseCategory[] = [
  "linens",
  "furnishings",
  "supplies",
  "appliance",
  "maintenance",
  "utilities",
  "other"
];

export function PurchasesManager({
  initialHomes,
  initialPurchases
}: {
  initialHomes: HomeSummary[];
  initialPurchases: HomePurchase[];
}) {
  const router = useRouter();
  const [purchases, setPurchases] = useState(initialPurchases);
  const [draft, setDraft] = useState<HomePurchaseInput>(() => blankPurchase());
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<HomeDepotImportRow[]>([]);
  const [importHomeId, setImportHomeId] = useState("");
  const [importCategory, setImportCategory] = useState<PurchaseCategory>("maintenance");
  const homeNames = useMemo(
    () => new Map(initialHomes.map((home) => [home.id, `${home.lhCode} · ${home.publicName}`])),
    [initialHomes]
  );
  const ytdYear = new Date().getFullYear();
  const ytdSpend = useMemo(
    () => purchases
      .filter((purchase) => purchase.purchaseDate.startsWith(`${ytdYear}-`))
      .reduce((total, purchase) => total + (purchase.totalCents ?? 0), 0),
    [purchases, ytdYear]
  );

  async function savePurchase() {
    setPending("save");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/homes/purchases", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ purchase: draft })
      });
      const result = (await response.json().catch(() => null)) as ApiResult<HomePurchase> | null;
      if (!response.ok || !result?.ok || !result.data) {
        throw new Error(result?.error?.message || "The purchase could not be saved.");
      }
      const saved = result.data;
      setPurchases((current) => sortPurchases([
        saved,
        ...current.filter((purchase) => purchase.id !== saved.id)
      ]));
      setDraft(blankPurchase());
      setIsFormOpen(false);
      setNotice(draft.id ? "Purchase updated." : "Purchase added to the private ledger.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The purchase could not be saved.");
    } finally {
      setPending(null);
    }
  }

  async function deletePurchase(purchase: HomePurchase) {
    if (!window.confirm(`Delete “${purchase.itemName}” from the purchases ledger?`)) return;
    setPending(`delete-${purchase.id}`);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/homes/purchases/${encodeURIComponent(purchase.id)}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      const result = (await response.json().catch(() => null)) as ApiResult<{ id: string }> | null;
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error?.message || "The purchase could not be deleted.");
      }
      setPurchases((current) => current.filter((candidate) => candidate.id !== purchase.id));
      if (draft.id === purchase.id) {
        setDraft(blankPurchase());
        setIsFormOpen(false);
      }
      setNotice("Purchase removed.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The purchase could not be deleted.");
    } finally {
      setPending(null);
    }
  }

  function startNewPurchase() {
    setDraft(blankPurchase());
    setError("");
    setNotice("");
    setIsFormOpen(true);
  }

  function editPurchase(purchase: HomePurchase) {
    setDraft(toDraft(purchase));
    setError("");
    setNotice("");
    setIsFormOpen(true);
  }

  async function readHomeDepotCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPending("parse-import");
    setError("");
    setNotice("");
    try {
      const rows = parseHomeDepotCsv(await file.text(), { homeId: importHomeId || undefined, category: importCategory });
      if (rows.length === 0) throw new Error("No purchasable Home Depot rows were found in that CSV.");
      const existingKeys = new Set(purchases.map(purchaseKey));
      setImportRows(rows.map((purchase, index) => ({
        id: `${index}-${purchase.vendorOrderNumber || "receipt"}-${purchase.itemName}`,
        purchase,
        duplicate: existingKeys.has(purchaseKey(purchase))
      })));
      setIsImportOpen(true);
      setNotice(`${rows.length} Home Depot row${rows.length === 1 ? "" : "s"} ready to review.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The CSV could not be read.");
    } finally {
      setPending(null);
    }
  }

  function updateImportDefaults(homeId: string, category: PurchaseCategory) {
    setImportHomeId(homeId);
    setImportCategory(category);
    setImportRows((current) => current.map((row) => ({
      ...row,
      purchase: { ...row.purchase, homeId: homeId || undefined, category }
    })));
  }

  async function importHomeDepotRows() {
    const selected = importRows.filter((row) => !row.duplicate).map((row) => row.purchase);
    if (selected.length === 0) {
      setError("There are no new rows to import.");
      return;
    }
    setPending("import");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/homes/purchases/import", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ purchases: selected })
      });
      const result = (await response.json().catch(() => null)) as ApiResult<ImportResult> | null;
      if (!response.ok || !result?.ok || !result.data) {
        throw new Error(result?.error?.message || "The Home Depot purchases could not be imported.");
      }
      setPurchases((current) => sortPurchases([...result.data!.created, ...current]));
      setImportRows([]);
      setIsImportOpen(false);
      setNotice(`${result.data.created.length} Home Depot purchase${result.data.created.length === 1 ? "" : "s"} imported${result.data.skippedDuplicates ? `; ${result.data.skippedDuplicates} duplicate${result.data.skippedDuplicates === 1 ? " was" : "s were"} skipped` : ""}.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The Home Depot purchases could not be imported.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className={styles.purchasesPage}>
      <header className={styles.purchasesHeader}>
        <div>
          <Link className={styles.backLink} href="/homes">← All homes</Link>
          <p className={styles.operatorEyebrow}>Private owner bookkeeping</p>
          <h1>Airbnb purchases</h1>
          <p>Keep a durable expense record for tax time, then use the vendor link to quickly buy the same item again.</p>
        </div>
          <div className={styles.purchasesHeaderActions}>
          <div className={styles.purchaseSummary}>
            <strong>{formatDollars(ytdSpend)}</strong>
            <span>{ytdYear} YTD total</span>
            </div>
          <label className={styles.importPurchaseButton}>
            {pending === "parse-import" ? "Reading CSV…" : "Import Home Depot CSV"}
            <input accept=".csv,text/csv" disabled={pending !== null} onChange={readHomeDepotCsv} type="file" />
          </label>
          <button className={styles.addPurchaseButton} onClick={startNewPurchase} type="button">Add purchase</button>
          <a className={styles.primaryLink} href="/api/homes/purchases/export">Export CSV</a>
        </div>
      </header>

      {notice ? <p className={styles.successNotice} role="status">{notice}</p> : null}
      {error ? <p className={styles.errorNotice} role="alert">{error}</p> : null}

      <div className={styles.purchaseLayout}>
        {isImportOpen ? <section className={styles.importPurchasePanel} aria-labelledby="home-depot-import-title">
          <div>
            <p className={styles.operatorEyebrow}>Review before importing</p>
            <h2 id="home-depot-import-title">Home Depot purchases</h2>
            <p>Upload the CSV from Pro Xtra Purchase History. Nothing is added until you confirm below.</p>
          </div>
          <div className={styles.formRow}>
            <label>
              <span>Assign to property</span>
              <select value={importHomeId} onChange={(event) => updateImportDefaults(event.target.value, importCategory)}>
                <option value="">All properties / unassigned</option>
                {initialHomes.map((home) => <option key={home.id} value={home.id}>{home.lhCode} · {home.publicName}</option>)}
              </select>
            </label>
            <label>
              <span>Default category</span>
              <select value={importCategory} onChange={(event) => updateImportDefaults(importHomeId, event.target.value as PurchaseCategory)}>
                {purchaseCategories.map((category) => <option key={category} value={category}>{labelFor(category)}</option>)}
              </select>
            </label>
          </div>
          <div className={styles.importSummary}>
            <strong>{importRows.filter((row) => !row.duplicate).length} new</strong>
            <span>{importRows.filter((row) => row.duplicate).length} already in the ledger</span>
          </div>
          <div className={styles.importRows}>
            {importRows.map((row) => <div className={row.duplicate ? styles.importDuplicate : styles.importRow} key={row.id}>
              <strong>{row.purchase.itemName}</strong>
              <span>{row.purchase.vendorOrderNumber ? `Receipt #${row.purchase.vendorOrderNumber}` : "Home Depot receipt"} · {formatDate(row.purchase.purchaseDate)} · {row.purchase.totalCents === undefined ? "Amount unavailable" : formatDollars(row.purchase.totalCents)}</span>
              <em>{row.duplicate ? "Already recorded" : `Qty ${row.purchase.quantity}`}</em>
            </div>)}
          </div>
          <div className={styles.formActions}>
            <button onClick={() => { setImportRows([]); setIsImportOpen(false); }} type="button">Cancel</button>
            <button className={styles.saveButton} disabled={pending !== null || importRows.every((row) => row.duplicate)} onClick={importHomeDepotRows} type="button">
              {pending === "import" ? "Importing…" : `Import ${importRows.filter((row) => !row.duplicate).length} new purchase${importRows.filter((row) => !row.duplicate).length === 1 ? "" : "s"}`}
            </button>
          </div>
        </section> : null}
        {isFormOpen ? <form className={styles.purchaseForm} onSubmit={(event) => { event.preventDefault(); savePurchase(); }}>
          <div>
            <p className={styles.operatorEyebrow}>{draft.id ? "Correct a record" : "Add a purchase"}</p>
            <h2>{draft.id ? "Edit purchase" : "New purchase"}</h2>
          </div>
          <div className={styles.formRow}>
            <label>
              <span>Property (optional)</span>
              <select value={draft.homeId || ""} onChange={(event) => setDraft({ ...draft, homeId: event.target.value || undefined })}>
                <option value="">All properties / unassigned</option>
                {initialHomes.map((home) => <option key={home.id} value={home.id}>{home.lhCode} · {home.publicName}</option>)}
              </select>
            </label>
            <label>
              <span>Purchase date</span>
              <input required type="date" value={draft.purchaseDate} onChange={(event) => setDraft({ ...draft, purchaseDate: event.target.value })} />
            </label>
          </div>
          <label>
            <span>Item name</span>
            <input required value={draft.itemName} placeholder="Queen sheet set" onChange={(event) => setDraft({ ...draft, itemName: event.target.value })} />
          </label>
          <label>
            <span>Description</span>
            <textarea rows={3} value={draft.description || ""} placeholder="Color, size, material, or other identifying details" onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </label>
          <div className={styles.formRow}>
            <label>
              <span>Category</span>
              <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as PurchaseCategory })}>
                {purchaseCategories.map((category) => <option key={category} value={category}>{labelFor(category)}</option>)}
              </select>
            </label>
            <label>
              <span>SKU or model</span>
              <input value={draft.sku || ""} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} />
            </label>
          </div>
          <div className={styles.formRow}>
            <label>
              <span>Vendor</span>
              <input required value={draft.vendorName} placeholder="Target" onChange={(event) => setDraft({ ...draft, vendorName: event.target.value })} />
            </label>
            <label>
              <span>Vendor / reorder link</span>
              <input inputMode="url" type="url" value={draft.vendorUrl || ""} placeholder="https://…" onChange={(event) => setDraft({ ...draft, vendorUrl: event.target.value })} />
            </label>
          </div>
          <div className={styles.formRow}>
            <label>
              <span>Order number</span>
              <input value={draft.vendorOrderNumber || ""} onChange={(event) => setDraft({ ...draft, vendorOrderNumber: event.target.value })} />
            </label>
            <label>
              <span>Receipt or invoice link</span>
              <input inputMode="url" type="url" value={draft.receiptUrl || ""} placeholder="https://…" onChange={(event) => setDraft({ ...draft, receiptUrl: event.target.value })} />
            </label>
          </div>
          <div className={styles.formRow}>
            <label>
              <span>Quantity</span>
              <input required min="1" step="1" type="number" value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: Math.max(1, Math.trunc(Number(event.target.value) || 1)) })} />
            </label>
            <label>
              <span>Total paid (optional)</span>
              <CurrencyInput cents={draft.totalCents} onChange={(value) => setDraft({ ...draft, totalCents: value })} />
            </label>
          </div>
          <div className={styles.formRow}>
            <label>
              <span>Sales tax</span>
              <CurrencyInput cents={draft.salesTaxCents} onChange={(value) => setOptionalCents(setDraft, draft, "salesTaxCents", value)} />
            </label>
            <label>
              <span>Shipping</span>
              <CurrencyInput cents={draft.shippingCents} onChange={(value) => setOptionalCents(setDraft, draft, "shippingCents", value)} />
            </label>
          </div>
          <label>
            <span>Private notes</span>
            <textarea rows={3} value={draft.notes || ""} placeholder="Useful reorder or bookkeeping context" onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
          </label>
          <div className={styles.formActions}>
            <button onClick={() => { setDraft(blankPurchase()); setIsFormOpen(false); }} type="button">Cancel</button>
            <button className={styles.saveButton} disabled={pending !== null || initialHomes.length === 0} type="submit">
              {pending === "save" ? "Saving…" : draft.id ? "Update purchase" : "Add purchase"}
            </button>
          </div>
        </form> : null}

        <section className={styles.purchaseLedger} aria-labelledby="purchase-ledger-title">
          <div className={styles.purchaseLedgerHeader}>
            <div>
              <p className={styles.operatorEyebrow}>Owner-only ledger</p>
              <h2 id="purchase-ledger-title">{purchases.length} purchase{purchases.length === 1 ? "" : "s"}</h2>
            </div>
            <a className={styles.secondaryLink} href="/api/homes/purchases/export">CSV</a>
          </div>
          {purchases.length === 0 ? (
            <div className={styles.emptyState}><h3>No purchases recorded</h3><p>Use Add purchase to create your first Airbnb expense.</p></div>
          ) : (
            <div className={styles.purchasesTableWrap}>
              <table className={styles.purchasesTable}>
                <thead>
                  <tr><th>Purchase</th><th>Property</th><th>Vendor</th><th>Date</th><th>Total</th><th><span className="sr-only">Actions</span></th></tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className={styles.purchaseCell}>
                        <strong>{purchase.itemName}</strong>
                        <small>{labelFor(purchase.category)}{purchase.sku ? ` · ${purchase.sku}` : ""}</small>
                        {purchase.description ? <details className={styles.purchaseDescription}>
                          <summary title={purchase.description}>{purchase.description}</summary>
                        </details> : null}
                        <span className={styles.purchaseLinks}>
                          {purchase.vendorUrl ? <a href={purchase.vendorUrl} rel="noreferrer" target="_blank">Reorder ↗</a> : null}
                          {purchase.receiptUrl ? <a href={purchase.receiptUrl} rel="noreferrer" target="_blank">Receipt ↗</a> : null}
                        </span>
                      </td>
                      <td>{purchase.homeId ? (homeNames.get(purchase.homeId) || "Unknown property") : "All properties / unassigned"}</td>
                      <td>{purchase.vendorName}{purchase.vendorOrderNumber ? <small>#{purchase.vendorOrderNumber}</small> : null}</td>
                      <td>{formatDate(purchase.purchaseDate)}</td>
                      <td>{purchase.totalCents === undefined ? "Not recorded" : formatDollars(purchase.totalCents)}{purchase.quantity > 1 ? <small>Qty {purchase.quantity}</small> : null}</td>
                      <td className={styles.purchaseActions}>
                        <button onClick={() => editPurchase(purchase)} type="button">Edit</button>
                        <button className={styles.textDanger} disabled={pending !== null} onClick={() => deletePurchase(purchase)} type="button">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CurrencyInput({ cents, required, onChange }: { cents?: number; required?: boolean; onChange: (value: number | undefined) => void }) {
  return (
    <div className={styles.currencyField}>
      <span aria-hidden="true">$</span>
      <input
        inputMode="decimal"
        min="0"
        placeholder="0.00"
        required={required}
        step="0.01"
        type="number"
        value={cents === undefined || cents === 0 ? "" : (cents / 100).toFixed(2)}
        onChange={(event) => onChange(toCents(event.target.value))}
      />
    </div>
  );
}

function blankPurchase(homeId?: string): HomePurchaseInput {
  return {
    ...(homeId ? { homeId } : {}),
    itemName: "",
    category: "other",
    vendorName: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    quantity: 1
  };
}

function toDraft(purchase: HomePurchase): HomePurchaseInput {
  return {
    id: purchase.id,
    homeId: purchase.homeId,
    itemName: purchase.itemName,
    description: purchase.description,
    sku: purchase.sku,
    category: purchase.category,
    vendorName: purchase.vendorName,
    vendorUrl: purchase.vendorUrl,
    vendorOrderNumber: purchase.vendorOrderNumber,
    receiptUrl: purchase.receiptUrl,
    purchaseDate: purchase.purchaseDate,
    quantity: purchase.quantity,
    totalCents: purchase.totalCents,
    salesTaxCents: purchase.salesTaxCents,
    shippingCents: purchase.shippingCents,
    notes: purchase.notes
  };
}

function setOptionalCents(
  setDraft: (value: HomePurchaseInput) => void,
  draft: HomePurchaseInput,
  key: "salesTaxCents" | "shippingCents",
  value: number | undefined
) {
  if (value !== undefined) {
    setDraft({ ...draft, [key]: value });
    return;
  }
  const { salesTaxCents, shippingCents, ...withoutOptional } = draft;
  if (key === "salesTaxCents") setDraft({ ...withoutOptional, shippingCents });
  else setDraft({ ...withoutOptional, salesTaxCents });
}

function toCents(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const dollars = Number(value);
  return Number.isFinite(dollars) && dollars >= 0 ? Math.round(dollars * 100) : undefined;
}

function sortPurchases(purchases: HomePurchase[]) {
  return purchases.sort((left, right) => right.purchaseDate.localeCompare(left.purchaseDate) || right.createdAt.localeCompare(left.createdAt));
}

function purchaseKey(purchase: Pick<HomePurchaseInput, "vendorName" | "vendorOrderNumber" | "purchaseDate" | "itemName">) {
  return [
    purchase.vendorName.trim().toLocaleLowerCase("en-US"),
    (purchase.vendorOrderNumber || "").trim().toLocaleLowerCase("en-US"),
    purchase.purchaseDate,
    purchase.itemName.trim().toLocaleLowerCase("en-US")
  ].join("|");
}

function parseHomeDepotCsv(
  content: string,
  defaults: { homeId?: string; category: PurchaseCategory }
): HomePurchaseInput[] {
  const [headers, ...rows] = parseCsv(content);
  if (!headers?.length) throw new Error("The CSV is empty.");
  const normalizedHeaders = headers.map(normalizeHeader);
  const cell = (row: string[], names: string[]) => {
    const index = normalizedHeaders.findIndex((header) => names.some((name) => header === name || header.includes(name)));
    return index >= 0 ? (row[index] || "").trim() : "";
  };
  return rows.flatMap((row) => {
    const orderNumber = cell(row, ["orderreceipt", "ordernumber", "receipt", "order"]);
    const date = parsePurchaseDate(cell(row, ["dateplaced", "dateordered", "purchasedate", "date"]));
    const itemName = cell(row, ["productdescription", "itemdescription", "product", "itemname", "description", "item"]);
    if (!date || (!orderNumber && !itemName)) return [];
    const totalCents = parseMoney(cell(row, ["linetotal", "itemtotal", "total", "amount", "price"]));
    const quantity = parseQuantity(cell(row, ["quantity", "qty"]));
    return [{
      ...defaults,
      itemName: itemName || `Home Depot receipt ${orderNumber || date}`,
      description: itemName ? undefined : "Imported from Home Depot Pro Xtra purchase history.",
      vendorName: "Home Depot",
      vendorOrderNumber: orderNumber || undefined,
      purchaseDate: date,
      quantity,
      ...(totalCents === undefined ? {} : { totalCents })
    }];
  });
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = content.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted && char === '"' && source[index + 1] === '"') { cell += '"'; index += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (!quoted && char === ",") { row.push(cell); cell = ""; continue; }
    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell); if (row.some((value) => value.trim())) rows.push(row); row = []; cell = ""; continue;
    }
    cell += char;
  }
  row.push(cell); if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "");
}

function parsePurchaseDate(value: string): string | undefined {
  const source = value.trim();
  if (!source) return undefined;
  const slash = source.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    return `${year}-${slash[1].padStart(2, "0")}-${slash[2].padStart(2, "0")}`;
  }
  const parsed = new Date(source);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed.toISOString().slice(0, 10);
}

function parseMoney(value: string): number | undefined {
  const amount = Number(value.replace(/[$,]/g, "").trim());
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : undefined;
}

function parseQuantity(value: string): number {
  const quantity = Math.trunc(Number(value));
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;
}

function labelFor(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDollars(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}
