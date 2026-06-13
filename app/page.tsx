import type { Metadata } from "next";
import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { getGameAvailability } from "@/lib/db";

export const metadata: Metadata = {
  title: "famous.land",
  description: "famous.land"
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const availability = await getGameAvailability();

  if (!availability.enabled) {
    return <GameUnavailablePage />;
  }

  return (
    <div className="image-home" aria-label="Famous Land">
      <img src="/assets/FamousLand2.png" alt="Famous Land" />
      <p className="home-launch-teaser">Coming July 2026</p>
    </div>
  );
}
