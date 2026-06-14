import { AdminSideNav } from "@/components/AdminSideNav";
import { GameAvailabilityToggle } from "@/components/GameAvailabilityToggle";
import { HomePageHeadlineForm } from "@/components/HomePageHeadlineForm";
import { getGameAvailability, getHomePageHeadline } from "@/lib/db";

export async function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [availability, homePageHeadline] = await Promise.all([
    getGameAvailability(),
    getHomePageHeadline()
  ]);

  return (
    <div className="admin-shell">
      <AdminSideNav />
      <div className="admin-shell-content">
        <GameAvailabilityToggle availability={availability} />
        <HomePageHeadlineForm headline={homePageHeadline} />
        {children}
      </div>
    </div>
  );
}
