import type { Metadata } from "next";
import { July2026Admin } from "./July2026Admin";

export const metadata: Metadata = {
  title: "July 4th, 2026 Admin | famous.land",
  description: "Editable Proof reference material and planning admin for the July 2026 guest portal.",
  robots: {
    index: false,
    follow: false
  }
};

export default function July2026AdminPage() {
  return <July2026Admin />;
}
