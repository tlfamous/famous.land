import { notFound } from "next/navigation";
import { HomesManager } from "@/components/homes/HomesManager";
import { getGuidePreview, getHomeForManagement } from "@/lib/property-ops";

type ManageHomePageProps = { params: Promise<{ homeId: string }> };

export default async function ManageHomePage({ params }: ManageHomePageProps) {
  const { homeId } = await params;
  const [view, guidePreview] = await Promise.all([
    getHomeForManagement(homeId),
    getGuidePreview(homeId).catch(() => undefined)
  ]);
  if (!view) notFound();
  if (!guidePreview) notFound();
  return <HomesManager initialGuidePreview={guidePreview} initialView={view} />;
}
