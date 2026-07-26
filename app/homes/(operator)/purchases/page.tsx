import { PurchasesManager } from "@/components/homes/PurchasesManager";
import { listHomePurchases, listHomes } from "@/lib/property-ops";

export default async function PurchasesPage() {
  const [homes, purchases] = await Promise.all([listHomes(), listHomePurchases()]);
  return <PurchasesManager initialHomes={homes} initialPurchases={purchases} />;
}
