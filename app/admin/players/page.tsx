import type { Metadata } from "next";
import { PlayerDatabaseTool } from "@/components/PlayerDatabaseTool";
import { getMessageAdminReport } from "@/lib/db";

export const metadata: Metadata = {
  title: "Players | Famous Land Admin",
  description: "Player database for Famous Land game activity and contacts."
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PlayersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PlayerContactTab = "all" | "email" | "phone";

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const params = (await searchParams) ?? {};
  const activeTab = parseContactTab(params.contact);
  const initialPlayerId = firstParam(params.player);
  const report = await getMessageAdminReport();
  const players = filterPlayersByContactTab(report.players, activeTab);
  const tabs = [
    {
      value: "all",
      label: "All players",
      count: report.total_players
    },
    {
      value: "email",
      label: "With email",
      count: report.players_with_email
    },
    {
      value: "phone",
      label: "With phone",
      count: report.players_with_phone
    }
  ] satisfies Array<{ value: PlayerContactTab; label: string; count: number }>;

  return (
    <div className="stack players-page">
      <PlayerDatabaseTool
        activeTab={activeTab}
        auditEvents={report.audit_events}
        initialPlayerId={initialPlayerId}
        messageEvents={report.message_events}
        players={players}
        tabs={tabs}
      />
    </div>
  );
}

function parseContactTab(value: string | string[] | undefined): PlayerContactTab {
  const tab = Array.isArray(value) ? value[0] : value;

  if (tab === "email" || tab === "phone") {
    return tab;
  }

  return "all";
}

function filterPlayersByContactTab(
  players: Awaited<ReturnType<typeof getMessageAdminReport>>["players"],
  tab: PlayerContactTab
) {
  if (tab === "email") {
    return players.filter((player) => Boolean(player.email));
  }

  if (tab === "phone") {
    return players.filter((player) => Boolean(player.phone_number));
  }

  return players;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[value.length - 1] : value;
}
