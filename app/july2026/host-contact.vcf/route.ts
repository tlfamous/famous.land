const hostContactLines = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "N:Host;July Weekend;;;",
  "FN:July Weekend Host",
  "ORG:July 4th Weekend",
  "TEL;TYPE=CELL,VOICE:7819294932",
  "URL:https://famous.land/july2026",
  "NOTE:July 4th, 2026 lake weekend host text line.",
  "END:VCARD"
];

export function GET() {
  return new Response(`${hostContactLines.join("\r\n")}\r\n`, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-disposition": 'attachment; filename="july-weekend-host.vcf"',
      "content-type": "text/vcard; charset=utf-8"
    }
  });
}
