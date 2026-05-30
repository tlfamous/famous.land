import QRCode from "qrcode";

function escapeSvgText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const portalUrl = "https://famous.land/july2026";
  const qrSvg = await QRCode.toString(portalUrl, {
    color: {
      dark: "#082141",
      light: "#fffdf7"
    },
    errorCorrectionLevel: "M",
    margin: 1,
    type: "svg",
    width: 360
  });
  const svg = qrSvg
    .replace("<svg ", `<svg role="img" aria-labelledby="july2026-qr-title july2026-qr-desc" `)
    .replace(
      ">",
      `><title id="july2026-qr-title">July 4th, 2026 guest portal QR code</title><desc id="july2026-qr-desc">${escapeSvgText(portalUrl)}</desc>`
    );

  return new Response(svg, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-disposition": 'inline; filename="famous-land-july-2026-portal-qr.svg"',
      "content-type": "image/svg+xml; charset=utf-8"
    }
  });
}
