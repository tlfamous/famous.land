import type { Metadata } from "next";
import Link from "next/link";
import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { GameStatusPill } from "@/components/GameStatusPill";
import { getGameAvailability, getHomePageHeadline } from "@/lib/db";

export const metadata: Metadata = {
  title: "famous.land",
  description: "famous.land"
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const [availability, homePageHeadline] = await Promise.all([
    getGameAvailability(),
    getHomePageHeadline()
  ]);

  if (!availability.enabled) {
    return <GameUnavailablePage headline={homePageHeadline} />;
  }

  return (
    <div className="image-home" aria-label="Famous Land">
      <img src="/assets/FamousLand2.png" alt="Famous Land" />
      <GameStatusPill isOn />
      <Link className="home-launch-teaser" href="/how-to-play">
        <span>Click here to start the quest</span>
      </Link>
    </div>
  );
}
