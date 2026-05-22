import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "famous.land",
  description: "famous.land"
};

export default function HomePage() {
  return (
    <div className="image-home" aria-label="Famous Land">
      <img src="/assets/FamousLand2.png" alt="Famous Land" />
      <Link className="home-couch-button" href="/couch">
        Play from your Couch
      </Link>
    </div>
  );
}
