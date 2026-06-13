import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { SaveProgressForm } from "@/components/SaveProgressForm";
import { getGameAvailability } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SaveProgressPage() {
  const availability = await getGameAvailability();

  if (!availability.enabled) {
    return <GameUnavailablePage />;
  }

  return <SaveProgressForm />;
}
