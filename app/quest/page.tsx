import type { Metadata } from "next";
import { FamousLandQuestDashboard } from "@/components/FamousLandQuestDashboard";
import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { getGameAvailability, getHomePageHeadline } from "@/lib/db";
import { isTesterScanSource } from "@/lib/testerMode";

export const metadata: Metadata = {
  title: "Famous Land Quest",
  description: "Your Famous Land Quest progress, zone quests, found markers, and recovery tools."
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function QuestPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = (await searchParams) ?? {};
  const [availability, homePageHeadline] = await Promise.all([
    getGameAvailability(),
    getHomePageHeadline()
  ]);

  if (!availability.enabled && !isTesterScanSource(query.scan_source)) {
    return <GameUnavailablePage headline={homePageHeadline} />;
  }

  return <FamousLandQuestDashboard />;
}
