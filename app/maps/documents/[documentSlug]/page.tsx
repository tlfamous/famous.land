import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMapReferenceImage,
  getMapReferencePages,
  mapReferenceImages
} from "@/lib/landParcels";

type MapDocumentPageProps = {
  params: Promise<{
    documentSlug: string;
  }>;
};

export function generateStaticParams() {
  return mapReferenceImages.map((image) => ({
    documentSlug: image.slug
  }));
}

export async function generateMetadata({
  params
}: MapDocumentPageProps): Promise<Metadata> {
  const { documentSlug } = await params;
  const image = getMapReferenceImage(documentSlug);

  if (!image) {
    return {
      title: "Survey Document"
    };
  }

  return {
    title: `${image.label} | Famous Land Maps`,
    description: image.detail
  };
}

export default async function MapDocumentPage({ params }: MapDocumentPageProps) {
  const { documentSlug } = await params;
  const image = getMapReferenceImage(documentSlug);
  const pages = getMapReferencePages(documentSlug);

  if (!image || pages.length === 0) {
    notFound();
  }

  return (
    <div className="map-document-page">
      <header className="map-document-toolbar">
        <div>
          <p className="eyebrow">Survey document</p>
          <h1>{image.label}</h1>
          <p>{image.detail}</p>
        </div>
        <nav className="map-document-actions" aria-label="Survey document actions">
          <Link className="button secondary" href="/maps">
            Back to maps
          </Link>
          <a className="button primary" href={pages[0].src} target="_blank" rel="noreferrer">
            Open page 1
          </a>
        </nav>
      </header>

      <div className="map-document-viewer">
        <div className="map-document-page-stack">
          {pages.map((page, index) => (
            <figure className="map-document-sheet" key={page.src}>
              <img alt={`${image.label} - page ${index + 1}`} src={page.src} />
              <figcaption>{page.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
