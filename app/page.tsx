import Link from "next/link";

export default function HomePage() {
  return (
    <div className="stack">
      <section className="home-hero">
        <div>
          <p className="eyebrow">Thirty markers. One summer quest.</p>
          <h1>Famous Land Summer Quest</h1>
          <p>
            Thirty markers are hidden across Famous Land, around the lake, through the
            woods, up the hills, along the road, and on the water. Find markers, unlock
            badges, follow clues, and complete the summer quest.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/progress">
              View my progress
            </Link>
            <Link className="button secondary" href="/quests">
              See quests
            </Link>
          </div>
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">How it works</p>
        <div className="steps">
          <div>
            <span>1</span>
            <strong>Find a tree marker</strong>
          </div>
          <div>
            <span>2</span>
            <strong>Scan the QR code</strong>
          </div>
          <div>
            <span>3</span>
            <strong>Collect markers and unlock badges</strong>
          </div>
          <div>
            <span>4</span>
            <strong>Save your progress after 5 finds</strong>
          </div>
        </div>
      </section>

      <section className="grid two">
        <article className="card">
          <h2>Start with one scan</h2>
          <p>
            There is no login at the beginning. The first marker you scan creates a private
            anonymous player ID in this browser using localStorage.
          </p>
        </article>
        <article className="card">
          <h2>Famous came this way.</h2>
          <p>
            The land itself is the game: lake edges, road turns, hills, deep woods, and one
            special island marker for supervised safe conditions.
          </p>
        </article>
      </section>

      <section className="card">
        <h2>Safety first</h2>
        <p>
          Play only with permission. Stay on safe paths and known areas. Do not climb trees,
          rocks, fences, or unstable structures. Children should be supervised near the
          lake.
        </p>
        <Link className="text-link" href="/safety">
          Read all safety notes
        </Link>
      </section>
    </div>
  );
}
