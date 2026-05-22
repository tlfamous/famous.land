import { AdminSideNav } from "@/components/AdminSideNav";

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-shell">
      <AdminSideNav />
      <div className="admin-shell-content">{children}</div>
    </div>
  );
}
