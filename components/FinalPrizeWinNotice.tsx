import Link from "next/link";
import { FINAL_PRIZE } from "@/lib/prizes";

export function FinalPrizeWinNotice({ className = "" }: { className?: string }) {
  return (
    <section
      className={["final-prize-win", className].filter(Boolean).join(" ")}
      aria-labelledby="final-prize-win-title"
      aria-live="polite"
    >
      <div>
        <p className="eyebrow">Grand prize unlocked</p>
        <h2 id="final-prize-win-title">You finished every quest.</h2>
        <p>
          You found {FINAL_PRIZE.markerGoalLabel}. Surprise: you won the grand prize,
          the {FINAL_PRIZE.title}.
        </p>
      </div>
      <Link className="button primary final-prize-win-button" href={FINAL_PRIZE.href}>
        Open grand prize page
      </Link>
    </section>
  );
}
