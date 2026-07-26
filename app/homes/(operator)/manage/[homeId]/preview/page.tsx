import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideRenderer } from "@/components/homes/GuideRenderer";
import styles from "@/components/homes/homes.module.css";
import { getGuidePreview } from "@/lib/property-ops";

type PreviewPageProps = { params: Promise<{ homeId: string }> };

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { homeId } = await params;
  const guide = await getGuidePreview(homeId).catch(() => undefined);
  if (!guide) notFound();
  const slug = guide.slug || "draft-guide";
  return (
    <div className={styles.fullPreview}>
      <Link href={`/homes/manage/${homeId}`}>← Back to editor</Link>
      <GuideRenderer
        canonicalUrl={guide.slug ? `https://famous.land/homes/${slug}` : "https://famous.land/homes/your-home"}
        guide={{
          publicName: guide.publicName,
          slug,
          media: guide.media.map((media) => ({
            id: media.id,
            title: media.title,
            altText: media.altText,
            src: `/api/homes/media/${encodeURIComponent(media.id)}/file`
          })),
          sections: guide.sections.map((section) => ({
            id: section.id,
            type: section.sectionType,
            title: section.title,
            body: section.body,
            position: section.displayOrder,
            wifi: section.wifi
          }))
        }}
        preview
        qrSrc={`/api/homes/${encodeURIComponent(homeId)}/qr.svg`}
      />
    </div>
  );
}
