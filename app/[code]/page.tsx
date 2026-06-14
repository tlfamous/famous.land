import { notFound } from "next/navigation";
import { GameUnavailablePage } from "@/components/GameUnavailablePage";
import { MarkerScanClient } from "@/components/MarkerScanClient";
import { getGameAvailability, getHomePageHeadline } from "@/lib/db";
import { getMarkerByToken, markers } from "@/lib/markers";
import { isTesterScanSource } from "@/lib/testerMode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return markers.map((marker) => ({
    code: marker.short_code
  }));
}

export default async function MarkerByCodePage({
  params,
  searchParams
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code } = await params;
  const query = (await searchParams) ?? {};
  const marker = getMarkerByToken(code);

  if (!marker) {
    notFound();
  }

  const [availability, homePageHeadline] = await Promise.all([
    getGameAvailability(),
    getHomePageHeadline()
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
