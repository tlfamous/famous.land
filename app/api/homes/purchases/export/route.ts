import { authorizeAdminRequest } from "@/lib/adminAuth";
import { listHomePurchases, listHomes, type HomePurchase } from "@/lib/property-ops";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CSV_HEADERS = [
  "Property",
  "Item name",
  "Description",
  "SKU",
  "Category",
  "Vendor",
  "Vendor URL",
  "Vendor order number",
  "Receipt URL",
  "Purchase date",
  "Quantity",
  "Total paid",
  "Sales tax",
  "Shipping",
  "Notes",
  "Created at",
  "Updated at"
];

function csvCell(value: string | number | undefined): string {
  let text = value === undefined ? "" : String(value);
  // Prevent spreadsheet formulas from evaluating data entered into the ledger.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function dollars(cents: number | undefined): string | undefined {
  if (cents === undefined) return undefined;
  return (cents / 100).toFixed(2);
}

function purchaseRow(purchase: HomePurchase, homeName: string): string {
  return [
    homeName,
    purchase.itemName,
    purchase.description,
    purchase.sku,
    purchase.category,
    purchase.vendorName,
    purchase.vendorUrl,
    purchase.vendorOrderNumber,
    purchase.receiptUrl,
    purchase.purchaseDate,
    purchase.quantity,
    dollars(purchase.totalCents),
    dollars(purchase.salesTaxCents),
    dollars(purchase.shippingCents),
    purchase.notes,
    purchase.createdAt,
    purchase.updatedAt
  ].map(csvCell).join(",");
}

export async function GET(request: Request) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;

  const [purchases, homes] = await Promise.all([listHomePurchases(), listHomes()]);
  const homeNames = new Map(homes.map((home) => [home.id, `${home.lhCode} · ${home.publicName}`]));
  const csv = [
    CSV_HEADERS.map(csvCell).join(","),
    ...purchases.map((purchase) => purchaseRow(purchase, purchase.homeId ? (homeNames.get(purchase.homeId) ?? purchase.homeId) : "All properties / unassigned"))
  ].join("\r\n");
  const today = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="famous-land-airbnb-purchases-${today}.csv"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
