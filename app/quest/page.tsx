import type { Metadata } from "next";
import { FamousLandQuestDashboard } from "@/components/FamousLandQuestDashboard";
import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { getGameAvailability, getHomePageHeadline } from "@/lib/db";

export const metadata: Metadata = {
  title: "Famous Land Quest",
  description: "Your Famous Land Quest progress, zone quests, found markers, and recovery tools."
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function QuestPage() {
  const [availability, homePageHeadline] = await Promise.all([
    getGameAvailability(),
    getHomePageHeadline()
  ]);

  if (!availability.enabled) {
    return <GameUnavailablePage headline={homePageHeadline} />;
  }

  return <FamousLandQuestDashboard />;
}
