import QRCode from "qrcode";
import { guestAssignments } from "../../../data";

type GuestQrRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

function escapeSvgText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function generateStaticParams() {
  return guestAssignments.map((guest) => ({
    slug: guest.slug
  }));
}

export async function GET(request: Request, { params }: GuestQrRouteProps) {
  const { slug } = await params;
  const guest = guestAssignments.find((assignment) => assignment.slug === slug);

  if (!guest) {
    return new Response("Guest not found.\n", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("t");
  const guestLinkUrl = new URL(`/july2026/guest/${guest.slug}`, "https://famous.land");

  if (token) {
    guestLinkUrl.searchParams.set("t", token);
  }

  const qrSvg = await QRCode.toString(guestLinkUrl.toString(), {
    color: {
      dark: "#082141",
      light: "#fffdf7"
    },
    errorCorrectionLevel: "M",
    margin: 1,
    type: "svg",
    width: 320
  });
  const svg = qrSvg.replace(
    "<svg ",
    `<svg role="img" aria-labelledby="guest-link-qr-title guest-link-qr-desc" `
  ).replace(
    ">",
    `><title id="guest-link-qr-title">${escapeSvgText(`${guest.name}'s guest QR code`)}</title><desc id="guest-link-qr-desc">${escapeSvgText(guestLinkUrl.toString())}</desc>`
  );

  return new Response(svg, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-disposition": `inline; filename="famous-land-july-2026-${guest.slug}-qr.svg"`,
      "content-type": "image/svg+xml; charset=utf-8"
    }
  });
}
