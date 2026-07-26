import QRCode from "qrcode";
import {
  getPublicGuideBySlug,
  resolvePublishedHomeSlugRedirect
} from "@/lib/property-ops";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const guide = await getPublicGuideBySlug(slug);
  if (!guide) {
    const redirectSlug = await resolvePublishedHomeSlugRedirect(slug);
    if (redirectSlug) {
      return Response.redirect(
        new URL(`/homes/${redirectSlug}/qr.svg`, request.url),
        308
      );
    }
    return new Response("Not Found", {
      status: 404,
      headers: publicHeaders("text/plain; charset=utf-8")
    });
  }

  const target = `https://famous.land/homes/${guide.slug}`;
  const svg = await QRCode.toString(target, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" }
  });
  return new Response(accessibleSvg(svg, `QR code for ${guide.publicName} instructions`), {
    headers: publicHeaders("image/svg+xml; charset=utf-8")
  });
}

function publicHeaders(contentType: string) {
  return {
    "Cache-Control": "private, no-store",
    "Content-Type": contentType,
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow, noarchive"
  };
}

function accessibleSvg(svg: string, label: string) {
  const safeLabel = label.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character] ?? character);
  return svg.replace("<svg ", `<svg role="img" aria-label="${safeLabel}" `);
}
