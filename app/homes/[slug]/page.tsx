import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { GuideRenderer } from "@/components/homes/GuideRenderer";
import styles from "@/components/homes/homes.module.css";
import {
  getPublicGuideBySlug,
  resolvePublishedHomeSlugRedirect
} from "@/lib/property-ops";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "House instructions | Famous Land",
  description: "House instructions for a Famous Land lake home.",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: { index: false, follow: false, noarchive: true }
  }
};

type PublicGuidePageProps = { params: Promise<{ slug: string }> };

export default async function PublicGuidePage({ params }: PublicGuidePageProps) {
  const { slug } = await params;
  const guide = await getPublicGuideBySlug(slug);
  if (!guide) {
    const redirectSlug = await resolvePublishedHomeSlugRedirect(slug);
    if (redirectSlug) permanentRedirect(`/homes/${redirectSlug}`);
    notFound();
  }

  const canonicalUrl = `https://famous.land/homes/${guide.slug}`;
  return (
    <div className={styles.guidePage}>
      <GuideRenderer
        canonicalUrl={canonicalUrl}
        guide={{
          publicName: guide.publicName,
          slug: guide.slug,
          publishedAt: guide.publishedAt,
          media: guide.media.map((media) => ({
            id: media.id,
            title: media.title,
            altText: media.altText,
            src: `/homes/${encodeURIComponent(guide.slug)}/media/${encodeURIComponent(media.id)}`
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
      />
    </div>
  );
}
