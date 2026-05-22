import { RecreationalUseNotice } from "@/components/RecreationalUseNotice";

export default function SafetyPage() {
  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">Rules</p>
        <h1>Use common sense</h1>
        <p>
          The quest is meant to make the land more fun, not riskier. Stop playing if
          anything feels unsafe.
        </p>
      </section>

      <RecreationalUseNotice />
    </div>
  );
}
