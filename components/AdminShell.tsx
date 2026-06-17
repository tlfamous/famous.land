import { AdminSideNav } from "@/components/AdminSideNav";
import { GameAvailabilityToggle } from "@/components/GameAvailabilityToggle";
import { getGameAvailability } from "@/lib/db";

export async function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const availability = await getGameAvailability();

  return (
    <div className="admin-shell">
      <AdminSideNav />
      <div className="admin-shell-content">
        <GameAvailabilityToggle availability={availability} />
        {children}
      </div>
    </div>
  );
}
