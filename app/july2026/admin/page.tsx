import type { Metadata } from "next";
import { requireJulyAdmin } from "./auth";
import { July2026Admin } from "./July2026Admin";

export const metadata: Metadata = {
  title: "July 4th, 2026 Admin | famous.land",
  description: "Guest list, invite links, and check-in status for the July 2026 guest portal.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function July2026AdminPage() {
  await requireJulyAdmin("/july2026/admin");

  return <July2026Admin />;
}
