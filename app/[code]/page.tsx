import { notFound } from "next/navigation";
import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { MarkerScanClient } from "@/components/MarkerScanClient";
import { getGameAvailability } from "@/lib/db";
import { getMarkerByToken, markers } from "@/lib/markers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return markers.map((marker) => ({
    code: marker.short_code
  }));
}

export default async function MarkerByCodePage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const marker = getMarkerByToken(code);

  if (!marker) {
    notFound();
  }

  const availability = await getGameAvailability();

  if (!availability.enabled) {
    return <GameUnavailablePage markerId={marker.marker_id} markerNumber={marker.marker_number} />;
  }

  return <MarkerScanClient marker={marker} />;
}
