import type { Metadata } from "next";
import { AdminRecoveryTool, type AdminRecoveryPlayer } from "@/components/AdminRecoveryTool";
import { getMessageAdminReport } from "@/lib/db";

export const metadata: Metadata = {
  title: "Messages | Famous Land Admin",
  description: "Email and text-message communication tools for Famous Land players."
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AdminMessagesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminMessagesPage({ searchParams }: AdminMessagesPageProps) {
  const params = (await searchParams) ?? {};
  const initialPlayerId = firstParam(params.player);
  const report = await getMessageAdminReport();
  const players: AdminRecoveryPlayer[] = report.players.map((player) => ({
    player_id: player.player_id,
    email: player.email,
    phone_number: player.phone_number,
    scan_count: player.scan_count,
    last_scan_at: player.last_scan_at
  }));

  return (
    <div className="stack admin-page messages-page">
      <section className="dashboard-page-header">
        <h1>Messages</h1>
        <p>Support, recovery, contact edits, and delivery evidence.</p>
      </section>

      <section className="report-stat-grid message-kpi-grid" aria-label="Message channel rollups">
        <article className="report-stat-card">
          <span>Email contacts</span>
          <strong>{report.players_with_email}</strong>
          <small>Players with saved recovery email</small>
        </article>
        <article className="report-stat-card">
          <span>Phone contacts</span>
          <strong>{report.players_with_phone}</strong>
          <small>Future text-message recipients</small>
        </article>
        <article className="report-stat-card">
          <span>Email messages</span>
          <strong>{report.message_events.length}</strong>
          <small>Latest logged Brevo send attempts</small>
        </article>
        <article className="report-stat-card">
          <span>Audit events</span>
          <strong>{report.audit_events.length}</strong>
          <small>Support actions and recovery requests</small>
        </article>
      </section>

      <AdminRecoveryTool
        players={players}
        messageEvents={report.message_events}
        auditEvents={report.audit_events}
        initialPlayerId={initialPlayerId}
      />
    </div>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[value.length - 1] : value;
}
