import { HomesDashboard } from "@/components/homes/HomesDashboard";
import { listHomes, listPortfolioHomeAlerts } from "@/lib/property-ops";

export default async function HomesPage() {
  const [homes, alerts] = await Promise.all([listHomes(), listPortfolioHomeAlerts()]);
  return <HomesDashboard alerts={alerts} homes={homes} />;
}
