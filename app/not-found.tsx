import Link from "next/link";

export default function NotFound() {
  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">Marker not found</p>
        <h1>This QR path is not in the Famous Land quest.</h1>
        <p>Check the marker code and try again, or head back to the Famous Land Quest.</p>
        <Link className="button primary" href="/quest">
          View quest
        </Link>
      </section>
    </div>
  );
}
