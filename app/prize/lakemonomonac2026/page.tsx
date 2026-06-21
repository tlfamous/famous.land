import type { Metadata } from "next";
import { ZonePreviewMap } from "@/components/InteractiveLandMap";
import { PrizeObjectViewer } from "@/components/PrizeObjectViewer";
import { FINAL_PRIZE } from "@/lib/prizes";

export const metadata: Metadata = {
  title: "Grand Prize | Famous Land",
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LakeMonomonac2026PrizePage() {
  return (
    <div className="stack prize-page">
      <PrizeObjectViewer />

      <section className="hero-card prize-intro">
        <p className="eyebrow">Grand prize</p>
        <h1>{FINAL_PRIZE.title}</h1>
        <p>
          Surprise. You found every marker and completed the Famous Land Quest.
          Your prize is waiting at Boat Launch.
        </p>
      </section>

      <section className="card prize-claim-card">
        <div className="prize-claim-copy">
          <p className="eyebrow">Claim instructions</p>
          <h2>Go to Boat Launch</h2>
          <p>
            Walk to the boat ramp spot marked on the map. There will be a bin there.
            Inside the bin is a lock box with the grand prize.
          </p>
          <div className="prize-lock-code" aria-label="Lock box combination code">
            <span>Lock box code</span>
            <strong>1234</strong>
          </div>
        </div>
        <div className="prize-claim-map" aria-label="Boat Launch prize pickup map">
          <ZonePreviewMap activeSlug="treetop-terrace" activeMarkerId="FF-TREE-016" />
          <p>Boat Launch / EWNJC</p>
        </div>
      </section>

      <section className="grid three prize-claim-steps" aria-label="Prize pickup steps">
        <article className="report-stat-card">
          <span>Step 1</span>
          <strong>Find the bin</strong>
          <small>Go to the Boat Launch marker area by the boat ramp.</small>
        </article>
        <article className="report-stat-card">
          <span>Step 2</span>
          <strong>Open the lock box</strong>
          <small>Use combination 1234 on the lock box inside the bin.</small>
        </article>
        <article className="report-stat-card">
          <span>Step 3</span>
          <strong>Take the prize</strong>
          <small>The Lake Monomonac model is yours. Nice work finishing the quest.</small>
        </article>
      </section>
    </div>
  );
}
