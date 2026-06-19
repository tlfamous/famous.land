import { notFound } from "next/navigation";
import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { MarkerScanClient } from "@/components/MarkerScanClient";
import { getGameAvailability, getHomePageHeadline, getMarkerWithFieldNote } from "@/lib/db";
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
  const baseMarker = getMarkerByToken(markerId);

  if (!baseMarker) {
    notFound();
  }

  const [availability, homePageHeadline, marker] = await Promise.all([
    getGameAvailability(),
    getHomePageHeadline(),
    getMarkerWithFieldNote(baseMarker)
  ]);

  if (!availability.enabled && !isTesterScanSource(query.scan_source)) {
    return (
      <GameUnavailablePage
        headline={homePageHeadline}
        markerId={marker.marker_id}
        markerNumber={marker.marker_number}
      />
    );
  }

  return <MarkerScanClient marker={marker} />;
}
