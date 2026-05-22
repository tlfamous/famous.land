import type { Metadata } from "next";
import Link from "next/link";
import { PrizeObjectViewer } from "@/components/PrizeObjectViewer";

export const metadata: Metadata = {
  title: "Famous Land",
  robots: {
    index: false,
    follow: false
  }
};

export default function LakeMonomonac2026PrizePage() {
  return (
    <div className="stack prize-page">
      <PrizeObjectViewer />

      <section className="hero-card prize-intro">
        <p className="eyebrow">Grand prize</p>
        <h1>3D Printed Lake Monomonac</h1>
        <p>
          Surprise. You found every marker and completed the Famous Land Quest.
          The grand prize is a 3D printed Lake Monomonac model.
        </p>
        <div className="button-row">
          <Link className="button primary" href="/quest">
            View quest progress
          </Link>
        </div>
      </section>
    </div>
  );
}
