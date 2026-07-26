import type { Metadata } from "next";
import { HomesShell } from "@/components/homes/HomesShell";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Homes | Famous Land",
  description: "Private owner workspace for the Famous Land lake houses.",
  robots: { index: false, follow: false, nocache: true }
};

export default async function HomesOperatorLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/homes");
  return <HomesShell>{children}</HomesShell>;
}
