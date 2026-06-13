import { notFound } from "next/navigation";
import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { MarkerScanClient } from "@/components/MarkerScanClient";
import { getGameAvailability } from "@/lib/db";
import { getMarkerByToken, markers } from "@/lib/markers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return markers.map((marker) => ({
    markerId: marker.marker_id
  }));
}

export default async function MarkerByIdPage({
  params
}: {
  params: Promise<{ markerId: string }>;
}) {
  const { markerId } = await params;
  const marker = getMarkerByToken(markerId);

  if (!marker) {
    notFound();
  }

  const availability = await getGameAvailability();

  if (!availability.enabled) {
    return <GameUnavailablePage markerId={marker.marker_id} />;
  }

  return <MarkerScanClient marker={marker} />;
}
