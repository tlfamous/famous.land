import QRCode from "qrcode";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import { getGuidePreview } from "@/lib/property-ops";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const guide = await getGuidePreview(homeId);
    const target = guide.slug
      ? `https://famous.land/homes/${guide.slug}`
      : "https://famous.land/homes/your-home";
    const svg = await QRCode.toString(target, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" }
    });
    return new Response(accessibleSvg(svg, `QR code for ${guide.publicName} instructions`), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive"
      }
    });
  } catch {
    return new Response("Not Found", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" }
    });
  }
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
