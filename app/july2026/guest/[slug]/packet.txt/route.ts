import { getGuestPacketText, guestAssignments } from "../../../data";

type GuestPacketRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return guestAssignments.map((guest) => ({
    slug: guest.slug
  }));
}

export async function GET(_request: Request, { params }: GuestPacketRouteProps) {
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

  return new Response(getGuestPacketText(guest), {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-disposition": `attachment; filename="famous-land-july-2026-${guest.slug}-room-key.txt"`,
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
