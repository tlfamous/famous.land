import { notFound } from "next/navigation";
import { MarkerScanClient } from "@/components/MarkerScanClient";
import { getMarkerByToken, markers } from "@/lib/markers";

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

  return <MarkerScanClient marker={marker} />;
}
