import { AdminShell } from "@/components/AdminShell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminShell>{children}</AdminShell>;
}
