import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span aria-hidden="true">🐄</span>
        <span>
          <strong>FAMOUS LAND</strong>
          <small>Summer Quest</small>
        </span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/progress">Progress</Link>
        <Link href="/quests">Quests</Link>
        <Link href="/safety">Safety</Link>
      </nav>
    </header>
  );
}
