"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminAuditEventRow, MessageEventRow } from "@/lib/db";

export type AdminRecoveryPlayer = {
  player_id: string;
  email?: string;
  phone_number?: string;
  scan_count: number;
  last_scan_at?: string;
};

type SendStatus = "idle" | "sending" | "sent" | "stub" | "error";
type EditStatus = "idle" | "saving" | "saved" | "error";

export function AdminRecoveryTool({
  players,
  messageEvents,
  auditEvents,
  initialPlayerId
}: {
  players: AdminRecoveryPlayer[];
  messageEvents: MessageEventRow[];
  auditEvents: AdminAuditEventRow[];
  initialPlayerId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPlayerId = initialPlayerId ?? searchParams.get("player") ?? "";
  const requestedPlayer = requestedPlayerId
    ? players.find((player) => player.player_id === requestedPlayerId)
    : undefined;
  const recoveryPlayers = useMemo(
    () => players.filter((player) => Boolean(player.email)),
    [players]
  );
  const [query, setQuery] = useState(requestedPlayer?.email ?? requestedPlayer?.player_id ?? "");
  const [email, setEmail] = useState(requestedPlayer?.email ?? "");
  const [selectedPlayerId, setSelectedPlayerId] = useState(requestedPlayer?.player_id ?? "");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [message, setMessage] = useState("");
  const [editEmail, setEditEmail] = useState(requestedPlayer?.email ?? "");
  const [editPhone, setEditPhone] = useState(requestedPlayer?.phone_number ?? "");
  const [editStatus, setEditStatus] = useState<EditStatus>("idle");
  const [editMessage, setEditMessage] = useState("");

  const filteredRecoveryPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return recoveryPlayers;
    }

    return recoveryPlayers.filter((player) => {
      return (
        player.player_id.toLowerCase().includes(normalizedQuery) ||
        player.email?.toLowerCase().includes(normalizedQuery) ||
        player.phone_number?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, recoveryPlayers]);

  const selectedPlayer = useMemo(() => {
    const normalizedEmail = email.trim().toLowerCase();
    return (
      players.find((player) => player.player_id === selectedPlayerId) ??
      players.find((player) => player.email?.toLowerCase() === normalizedEmail)
    );
  }, [email, players, selectedPlayerId]);

  const selectedPlayerMessageEvents = useMemo(() => {
    if (!selectedPlayer) return [];
    return messageEvents.filter((event) => event.player_id === selectedPlayer.player_id);
  }, [messageEvents, selectedPlayer]);

  const selectedPlayerAuditEvents = useMemo(() => {
    if (!selectedPlayer) return [];
    return auditEvents.filter((event) => event.player_id === selectedPlayer.player_id);
  }, [auditEvents, selectedPlayer]);

  const latestRecoveryByPlayer = useMemo(() => {
    const latest = new Map<string, MessageEventRow>();

    for (const event of messageEvents) {
      if (!event.player_id || event.message_type !== "recovery") {
        continue;
      }

      const current = latest.get(event.player_id);
      if (!current || event.created_at > current.created_at) {
        latest.set(event.player_id, event);
      }
    }

    return latest;
  }, [messageEvents]);

  useEffect(() => {
    if (!requestedPlayerId) return;
    const initialPlayer = players.find((player) => player.player_id === requestedPlayerId);
    if (initialPlayer) {
      selectPlayer(initialPlayer);
      setQuery(initialPlayer.email ?? initialPlayer.player_id);
    }
  }, [requestedPlayerId, players]);

  function selectPlayer(player: AdminRecoveryPlayer) {
    setSelectedPlayerId(player.player_id);
    setEmail(player.email ?? "");
    setEditEmail(player.email ?? "");
    setEditPhone(player.phone_number ?? "");
    setEditStatus("idle");
    setEditMessage("");
    setStatus("idle");
    setMessage("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const response = await fetch("/api/recover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email
      })
    });

    const data = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
          mode?: "email_sent" | "stub";
          message?: string;
        }
      | null;

    if (!response.ok || !data?.ok) {
      setStatus("error");
      setMessage(data?.error ?? "Recovery email could not be sent. Check the address and try again.");
      return;
    }

    const nextStatus = data.mode === "email_sent" ? "sent" : "stub";
    setStatus(nextStatus);
    setMessage(data.message ?? "If progress exists for that email, a recovery link is on the way.");
    router.refresh();
  }

  async function onContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPlayer) {
      setEditStatus("error");
      setEditMessage("Choose a player first.");
      return;
    }

    setEditStatus("saving");
    setEditMessage("");

    const response = await fetch("/api/admin/player-contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: selectedPlayer.player_id,
        email: editEmail,
        phone_number: editPhone
      })
    });

    const data = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
        }
      | null;

    if (!response.ok || !data?.ok) {
      setEditStatus("error");
      setEditMessage(data?.error ?? "Contact details could not be saved.");
      return;
    }

    setEditStatus("saved");
    setEditMessage("Contact details saved.");
    setEmail(editEmail);
    router.refresh();
  }

  return (
    <>
      <section className="recovery-workspace">
        <section className="card report-log-card recovery-candidates-card">
          <div className="split report-section-head">
            <div>
              <p className="eyebrow">Saved contacts</p>
              <h2>Recovery candidates</h2>
            </div>
            <span>
              {recoveryPlayers.length
                ? `${recoveryPlayers.length} row${recoveryPlayers.length === 1 ? "" : "s"}`
                : "No saved emails"}
            </span>
          </div>
          <label className="field compact-search" htmlFor="recovery-candidate-search">
            <span>Lookup</span>
            <input
              id="recovery-candidate-search"
              type="search"
              placeholder="Search email, phone ID, or phone"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="report-table-wrap recovery-candidates-scroll">
            <table className="report-table players-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Phone ID</th>
                  <th>Scans</th>
                  <th>Last scan</th>
                  <th>Last recovery</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecoveryPlayers.length ? (
                  filteredRecoveryPlayers.map((player) => (
                    <tr
                      className={selectedPlayer?.player_id === player.player_id ? "selected-row" : undefined}
                      key={`${player.player_id}-${player.email}`}
                    >
                      <td>{player.email}</td>
                      <td>
                        <code title={player.player_id}>{shortPlayerId(player.player_id)}</code>
                      </td>
                      <td>{player.scan_count}</td>
                      <td>
                        {player.last_scan_at
                          ? formatEasternDateTime(player.last_scan_at)
                          : "No scans"}
                      </td>
                      <td>
                        {latestRecoveryByPlayer.get(player.player_id)
                          ? formatEasternDateTime(
                              latestRecoveryByPlayer.get(player.player_id)?.created_at ?? ""
                            )
                          : "Not sent"}
                      </td>
                      <td>
                        <button
                          className="button secondary compact-button"
                          type="button"
                          onClick={() => selectPlayer(player)}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No saved player emails match that lookup.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card message-actions-card">
          <div className="message-action-panel">
            <div className="report-section-head">
              <div>
                <p className="eyebrow">Recovery sender</p>
                <h2>Email a recovery link</h2>
              </div>
            </div>
            <form className="form" onSubmit={onSubmit}>
              <label htmlFor="recovery-email">Player email</label>
              <input
                id="recovery-email"
                list="recovery-player-emails"
                inputMode="email"
                type="email"
                autoComplete="email"
                placeholder="player@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSelectedPlayerId("");
                }}
                required
              />
              <datalist id="recovery-player-emails">
                {recoveryPlayers.map((player) => (
                  <option key={`${player.player_id}-${player.email}`} value={player.email} />
                ))}
              </datalist>
              <p className="form-note">
                Sends the one-tap recovery email. The player should open it on the phone
                they use for the quest.
              </p>
              <button className="button primary" disabled={status === "sending"} type="submit">
                {status === "sending" ? "Sending..." : "Send recovery email"}
              </button>
            </form>

            {selectedPlayer ? (
              <div className="notice message-selected-player">
                <p>
                  Matched <code>{shortPlayerId(selectedPlayer.player_id)}</code> with{" "}
                  {selectedPlayer.scan_count} scan{selectedPlayer.scan_count === 1 ? "" : "s"}
                  {selectedPlayer.last_scan_at
                  ? `, latest ${formatEasternDateTime(selectedPlayer.last_scan_at)}.`
                  : "."}
                </p>
                <dl>
                  <div>
                    <dt>Messages</dt>
                    <dd>{selectedPlayerMessageEvents.length}</dd>
                  </div>
                  <div>
                    <dt>Audit</dt>
                    <dd>{selectedPlayerAuditEvents.length}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{selectedPlayer.phone_number ? "yes" : "no"}</dd>
                  </div>
                </dl>
              </div>
            ) : null}

            {message ? (
              <div className={status === "error" ? "notice error" : "notice"}>
                <p>{message}</p>
              </div>
            ) : null}
          </div>

          <div className="message-action-panel">
            <div className="report-section-head">
              <div>
                <p className="eyebrow">Contact edit</p>
                <h2>Player contact</h2>
              </div>
            </div>
            {selectedPlayer ? (
              <form className="form compact-form" onSubmit={onContactSubmit}>
                <p className="form-note">
                  Editing <code>{shortPlayerId(selectedPlayer.player_id)}</code>
                </p>
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  inputMode="email"
                  type="email"
                  autoComplete="email"
                  placeholder="player@example.com"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                />
                <label htmlFor="contact-phone">Phone number</label>
                <input
                  id="contact-phone"
                  inputMode="tel"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(978) 555-0100"
                  value={editPhone}
                  onChange={(event) => setEditPhone(event.target.value)}
                />
                <button className="button secondary" disabled={editStatus === "saving"} type="submit">
                  {editStatus === "saving" ? "Saving..." : "Save contact"}
                </button>
              </form>
            ) : (
              <p className="form-note">Select a recovery candidate to edit their email or phone.</p>
            )}

            {editMessage ? (
              <div className={editStatus === "error" ? "notice error" : "notice"}>
                <p>{editMessage}</p>
              </div>
            ) : null}
          </div>
        </section>
      </section>

      <section className="messages-log-grid">
        <section className="card report-log-card message-log-card">
          <div className="split report-section-head">
            <div>
              <p className="eyebrow">Email log</p>
              <h2>Latest message events</h2>
            </div>
            <span>{messageEvents.length ? `${messageEvents.length} rows` : "No sends logged"}</span>
          </div>
          <div className="report-table-wrap dense-log-scroll">
            <table className="report-table message-event-table">
              <thead>
                <tr>
                  <th>Date/time</th>
                  <th>Type</th>
                  <th>Recipient</th>
                  <th>Phone ID</th>
                  <th>Provider</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {messageEvents.length ? (
                  messageEvents.map((event) => (
                    <tr key={event.id}>
                      <td>{formatEasternDateTime(event.created_at)}</td>
                      <td>{messageTypeLabel(event.message_type)}</td>
                      <td>{event.recipient}</td>
                      <td>
                        {event.player_id ? (
                          <code title={event.player_id}>{shortPlayerId(event.player_id)}</code>
                        ) : (
                          "Unknown"
                        )}
                      </td>
                      <td>
                        <strong>{event.provider ?? "Unconfigured"}</strong>
                        {event.provider_message_id ? <small>{event.provider_message_id}</small> : null}
                      </td>
                      <td>
                        <span className={`scan-type ${event.status === "sent" ? "real" : "test"}`}>
                          {event.status}
                        </span>
                        {event.error ? <small>{event.error}</small> : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No message events have been logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card report-log-card audit-log-card">
          <div className="split report-section-head">
            <div>
              <p className="eyebrow">Audit trail</p>
              <h2>Support activity</h2>
            </div>
            <span>{auditEvents.length ? `${auditEvents.length} rows` : "No audit events"}</span>
          </div>
          <div className="report-table-wrap dense-log-scroll">
            <table className="report-table audit-event-table">
              <thead>
                <tr>
                  <th>Date/time</th>
                  <th>Action</th>
                  <th>Phone ID</th>
                  <th>Target</th>
                  <th>Result</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.length ? (
                  auditEvents.map((event) => (
                    <tr key={event.id}>
                      <td>{formatEasternDateTime(event.created_at)}</td>
                      <td>{event.action}</td>
                      <td>
                        {event.player_id ? (
                          <code title={event.player_id}>{shortPlayerId(event.player_id)}</code>
                        ) : (
                          "Unknown"
                        )}
                      </td>
                      <td>{event.target ?? "None"}</td>
                      <td>
                        <span className={`scan-type ${event.result === "sent" || event.result === "updated" ? "real" : "test"}`}>
                          {event.result}
                        </span>
                      </td>
                      <td>{event.detail ?? ""}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No support actions have been logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </>
  );
}

const easternDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

function formatEasternDateTime(isoDate: string) {
  return easternDateTimeFormatter.format(new Date(isoDate));
}

function shortPlayerId(playerId: string) {
  return playerId.length > 12 ? `${playerId.slice(0, 8)}...` : playerId;
}

function messageTypeLabel(messageType: string) {
  return messageType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
