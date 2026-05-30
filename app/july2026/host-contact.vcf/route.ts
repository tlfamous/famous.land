const hostContactLines = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "N:Famous Land;Host;;;",
  "FN:Famous Land Host",
  "ORG:famous.land",
  "TEL;TYPE=CELL,VOICE:7819294932",
  "URL:https://famous.land/july2026",
  "NOTE:July 4th, 2026 lake weekend host text line.",
  "END:VCARD"
];

export function GET() {
  return new Response(`${hostContactLines.join("\r\n")}\r\n`, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-disposition": 'attachment; filename="famous-land-host.vcf"',
      "content-type": "text/vcard; charset=utf-8"
    }
  });
}
