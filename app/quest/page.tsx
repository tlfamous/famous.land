import type { Metadata } from "next";
import { FamousLandQuestDashboard } from "@/components/FamousLandQuestDashboard";

export const metadata: Metadata = {
  title: "Famous Land Quest",
  description: "Your Famous Land Quest progress, zone quests, found markers, and recovery tools."
};

export default function QuestPage() {
  return <FamousLandQuestDashboard />;
}
