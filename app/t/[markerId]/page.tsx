import { notFound } from "next/navigation";
import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { MarkerScanClient } from "@/components/MarkerScanClient";
import { getGameAvailability } from "@/lib/db";
import { getMarkerByToken, markers } from "@/lib/markers";
import { isTesterScanSource } from "@/lib/testerMode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return markers.map((marker) => ({
    markerId: marker.marker_id
  }));
}

export default async function MarkerByIdPage({
  params,
  searchParams
}: {
  params: Promise<{ markerId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { markerId } = await params;
  const query = (await searchParams) ?? {};
  const marker = getMarkerByToken(markerId);

  if (!marker) {
    notFound();
  }

  const availability = await getGameAvailability();

  if (!availability.enabled && !isTesterScanSource(query.scan_source)) {
    return <GameUnavailablePage markerId={marker.marker_id} markerNumber={marker.marker_number} />;
  }

  return <MarkerScanClient marker={marker} />;
}
