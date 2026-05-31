import { guestAssignments } from "../../../data";

type GuestCalendarRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

function escapeCalendarText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function foldCalendarLine(line: string) {
  const chunks: string[] = [];
  let remaining = line;

  while (remaining.length > 74) {
    chunks.push(remaining.slice(0, 74));
    remaining = ` ${remaining.slice(74)}`;
  }

  chunks.push(remaining);
  return chunks;
}

export function generateStaticParams() {
  return guestAssignments.map((guest) => ({
    slug: guest.slug
  }));
}

export async function GET(_request: Request, { params }: GuestCalendarRouteProps) {
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

  const assignment =
    guest.house === "Pending"
      ? "Assignment pending. Text the host before arrival for current lodging details."
      : `${guest.house} / ${guest.room}`;
  const description = [
    `${guest.name}'s July 4th, 2026 guest calendar.`,
    `Assignment: ${assignment}`,
    `Arrival: ${guest.arrival}`,
    `Departure: ${guest.departure}`,
    `Guest link: https://famous.land/july2026/guest/${guest.slug}`,
    `Personal packet: https://famous.land/july2026/guest/${guest.slug}/packet.txt`,
    "Host text line: 781-929-4932"
  ].join("\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//famous.land//July 2026 Guest Link//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeCalendarText(`${guest.name}'s July 4th, 2026 Stay`)}`,
    "X-WR-CALDESC:Personal guest calendar.",
    "BEGIN:VEVENT",
    `UID:july2026-${guest.slug}-stay@famous.land`,
    "DTSTAMP:20260530T000000Z",
    "DTSTART:20260703T190000Z",
    "DTEND:20260705T210000Z",
    `SUMMARY:${escapeCalendarText(`${guest.name}'s July 4th, 2026 stay`)}`,
    `LOCATION:${escapeCalendarText(guest.house === "Pending" ? "Host-confirmed lake house" : assignment)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    `URL:https://famous.land/july2026/guest/${guest.slug}`,
    "END:VEVENT",
    "BEGIN:VEVENT",
    `UID:july2026-${guest.slug}-checkin@famous.land`,
    "DTSTAMP:20260530T000000Z",
    "DTSTART:20260703T190000Z",
    "DTEND:20260703T220000Z",
    "SUMMARY:Guest check-in window",
    `LOCATION:${escapeCalendarText(guest.house === "Pending" ? "Assigned lake house" : guest.house)}`,
    `DESCRIPTION:${escapeCalendarText(`Arrive and settle in. ${assignment}`)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].flatMap(foldCalendarLine);

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-disposition": `attachment; filename="famous-land-july-2026-${guest.slug}.ics"`,
      "content-type": "text/calendar; charset=utf-8"
    }
  });
}
