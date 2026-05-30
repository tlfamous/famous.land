import type { Metadata } from "next";
import { July2026App } from "./July2026App";

export const metadata: Metadata = {
  title: "July 4th, 2026 | famous.land",
  description:
    "A resort-style guest portal for the famous.land July 4th, 2026 lake weekend.",
  alternates: {
    canonical: "/july2026"
  }
};

export default function July2026Page() {
  return <July2026App />;
}
