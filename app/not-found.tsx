import Link from "next/link";

export default function NotFound() {
  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">Marker not found</p>
        <h1>This QR path is not in the Famous Land quest.</h1>
        <p>Check the marker code and try again, or head back to your progress page.</p>
        <Link className="button primary" href="/progress">
          View my progress
        </Link>
      </section>
    </div>
  );
}
