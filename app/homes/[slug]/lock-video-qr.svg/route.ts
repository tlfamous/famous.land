import QRCode from "qrcode";
import { getPublicGuideBySlug } from "@/lib/property-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCK_VIDEO_URL = "https://www.youtube.com/watch?v=FnqhGuyrRAM";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getPublicGuideBySlug(slug);
  if (!guide) return new Response("Not found", { status: 404 });

  const svg = await QRCode.toString(LOCK_VIDEO_URL, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" }
  });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    }
  });
}
