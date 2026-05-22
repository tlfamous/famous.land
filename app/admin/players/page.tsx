import type { Metadata } from "next";
import Link from "next/link";
import { getPlayerReport } from "@/lib/db";

export const metadata: Metadata = {
  title: "Players | Famous Land Admin",
  description: "Player database for Famous Land game activity and contacts."
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const easternDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
});

export default async function PlayersPage() {
  const report = await getPlayerReport();

  return (
    <div className="stack players-page">
      <section className="hero-card players-hero">
        <p className="eyebrow">Players</p>
        <h1>Player Database</h1>
        <p>
          Each row is one phone ID, with scan activity and any contact details saved
          for that player.
        </p>
      </section>

      <section className="report-stat-grid" aria-label="Player rollups">
        <article className="report-stat-card">
          <span>Players</span>
          <strong>{report.total_players}</strong>
          <small>Unique phone IDs</small>
        </article>
        <article className="report-stat-card">
          <span>With email</span>
          <strong>{report.players_with_email}</strong>
          <small>Saved progress contacts</small>
        </article>
        <article className="report-stat-card">
          <span>With phone</span>
          <strong>{report.players_with_phone}</strong>
          <small>SMS contacts captured</small>
        </article>
      </section>

      <section className="card report-log-card">
        <div className="split report-section-head">
          <div>
            <p className="eyebrow">Database</p>
            <h2>Players</h2>
          </div>
          <span>{report.players.length ? `${report.players.length} rows` : "No players yet"}</span>
        </div>
        <div className="report-table-wrap">
          <table className="report-table players-table">
            <thead>
              <tr>
                <th>Phone ID</th>
                <th>Scans</th>
                <th>Last scan</th>
                <th>Email</th>
                <th>Phone number</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              {report.players.length ? (
                report.players.map((player) => (
                  <tr key={player.player_id}>
                    <td>
                      <code>{player.player_id}</code>
                    </td>
                    <td>{player.scan_count}</td>
                    <td>
                      {player.last_scan_at ? formatEasternDateTime(player.last_scan_at) : "No scans"}
                    </td>
                    <td>{player.email ?? "Not saved"}</td>
                    <td>{player.phone_number ?? "Not captured"}</td>
                    <td>
                      <Link
                        className="button secondary compact-button"
                        href={`/admin/messages?player=${encodeURIComponent(player.player_id)}`}
                      >
                        Open messages
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No player rows yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function formatEasternDateTime(isoDate: string) {
  return easternDateTimeFormatter.format(new Date(isoDate));
}
