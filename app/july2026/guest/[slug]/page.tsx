import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { July2026App } from "../../July2026App";
import { guestAssignments } from "../../data";

type GuestPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return guestAssignments.map((guest) => ({
    slug: guest.slug
  }));
}

export async function generateMetadata({ params }: GuestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guest = guestAssignments.find((assignment) => assignment.slug === slug);

  if (!guest) {
    return {
      title: "July 4th, 2026 Guest | famous.land"
    };
  }

  return {
    title: `${guest.name}'s July 4th, 2026 Stay | famous.land`,
    description: `Personalized room-key view for ${guest.name} at the famous.land July 4th, 2026 lake weekend.`,
    robots: {
      follow: false,
      index: false
    }
  };
}

export default async function July2026GuestPage({ params }: GuestPageProps) {
  const { slug } = await params;
  const guest = guestAssignments.find((assignment) => assignment.slug === slug);

  if (!guest) {
    notFound();
  }

  return <July2026App selectedGuestSlug={guest.slug} />;
}
