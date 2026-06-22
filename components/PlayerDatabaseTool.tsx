"use client";

import { Fragment, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { copyTextToClipboard } from "@/components/copyTextToClipboard";
import type { AdminAuditEventRow, MessageEventRow, PlayerReportRow } from "@/lib/db";

type PlayerContactTab = "all" | "email" | "phone";
type SendStatus = "idle" | "sending" | "sent" | "stub" | "error";
type EditStatus = "idle" | "saving" | "saved" | "error";
type SmsStatus = "idle" | "generating" | "copied" | "ready" | "error";

export function PlayerDatabaseTool({
  activeTab,
  auditEvents,
  messageEvents,
  players,
  tabs,
  initialPlayerId
}: {
  activeTab: PlayerContactTab;
  auditEvents: AdminAuditEventRow[];
  messageEvents: MessageEventRow[];
  players: PlayerReportRow[];
  tabs: Array<{ value: PlayerContactTab; label: string; count: number }>;
  initialPlayerId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPlayerId = initialPlayerId ?? searchParams.get("player") ?? "";
  const [selectedPlayerId, setSelectedPlayerId] = useState(requestedPlayerId);
  const selectedPlayer = useMemo(
    () => players.find((player) => player.player_id === selectedPlayerId),
    [players, selectedPlayerId]
  );
  const [editName, setEditName] = useState(selectedPlayer?.name ?? "");
  const [editEmail, setEditEmail] = useState(selectedPlayer?.email ?? "");
  const [editPhone, setEditPhone] = useState(selectedPlayer?.phone_number ?? "");
  const [editStatus, setEditStatus] = useState<EditStatus>("idle");
  const [editMessage, setEditMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState<SendStatus>("idle");
  const [emailMessage, setEmailMessage] = useState("");
  const [smsStatus, setSmsStatus] = useState<SmsStatus>("idle");
  const [smsMessage, setSmsMessage] = useState("");
  const [smsCopy, setSmsCopy] = useState("");
  const savedEmail = editStatus === "saved" ? editEmail.trim() : selectedPlayer?.email;
  const savedPhone = editStatus === "saved" ? editPhone.trim() : selectedPlayer?.phone_number;

  const selectedPlayerMessageEvents = useMemo(() => {
    if (!selectedPlayer) return [];
    return messageEvents.filter((event) => event.player_id === selectedPlayer.player_id);
  }, [messageEvents, selectedPlayer]);

  const selectedPlayerAuditEvents = useMemo(() => {
    if (!selectedPlayer) return [];
    return auditEvents.filter((event) => event.player_id === selectedPlayer.player_id);
  }, [auditEvents, selectedPlayer]);

  useEffect(() => {
    if (!selectedPlayer) return;
    setEditName(selectedPlayer.name ?? "");
    setEditEmail(selectedPlayer.email ?? "");
    setEditPhone(selectedPlayer.phone_number ?? "");
    setEditStatus("idle");
    setEditMessage("");
    setEmailStatus("idle");
    setEmailMessage("");
    setSmsStatus("idle");
    setSmsMessage("");
    setSmsCopy("");
  }, [selectedPlayer]);

  function selectPlayer(player: PlayerReportRow) {
    if (selectedPlayerId === player.player_id) {
      closeProfile();
      return;
    }

    setSelectedPlayerId(player.player_id);
  }

  function closeProfile() {
    setSelectedPlayerId("");
    setEditName("");
    setEditEmail("");
    setEditPhone("");
    setEditStatus("idle");
    setEditMessage("");
    setEmailStatus("idle");
    setEmailMessage("");
    setSmsStatus("idle");
    setSmsMessage("");
    setSmsCopy("");
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
        name: editName,
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
    setEditMessage("Player profile saved.");
    router.refresh();
  }

  async function onRecoveryEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPlayer || !savedEmail) {
      setEmailStatus("error");
      setEmailMessage("Add an email before sending recovery.");
      return;
    }

    setEmailStatus("sending");
    setEmailMessage("");

    const response = await fetch("/api/recover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: savedEmail
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
      setEmailStatus("error");
      setEmailMessage(data?.error ?? "Recovery email could not be sent.");
      return;
    }

    setEmailStatus(data.mode === "email_sent" ? "sent" : "stub");
    setEmailMessage(data.message ?? "If progress exists for that email, a recovery link is on the way.");
  }

  async function generateSmsCopy() {
    if (!selectedPlayer || !savedPhone) {
      setSmsStatus("error");
      setSmsMessage("Add a phone number before generating SMS copy.");
      return;
    }

    setSmsStatus("generating");
    setSmsMessage("");
    setSmsCopy("");

    const response = await fetch("/api/admin/player-recovery-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: selectedPlayer.player_id
      })
    });

    const data = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
          sms_text?: string;
        }
      | null;

    if (!response.ok || !data?.ok || !data.sms_text) {
      setSmsStatus("error");
      setSmsMessage(data?.error ?? "SMS recovery copy could not be generated.");
      return;
    }

    setSmsCopy(data.sms_text);

    if (await copyTextToClipboard(data.sms_text)) {
      setSmsStatus("copied");
      setSmsMessage("SMS recovery copy is on your clipboard.");
      return;
    }

    setSmsStatus("ready");
    setSmsMessage("SMS recovery copy is ready below. Select it or tap Copy message.");
  }

  async function copyPreparedSmsCopy() {
    if (!smsCopy) return;

    if (await copyTextToClipboard(smsCopy)) {
      setSmsStatus("copied");
      setSmsMessage("SMS recovery copy is on your clipboard.");
      return;
    }

    setSmsStatus("ready");
    setSmsMessage("Select the SMS copy below and copy it manually.");
  }

  return (
    <section className="player-database-workspace">
      <section className="card report-log-card">
        <div className="split report-section-head">
          <div>
            <p className="eyebrow">Database</p>
            <h2>Players</h2>
          </div>
          <span>{players.length ? `${players.length} rows` : "No players yet"}</span>
        </div>
        <nav className="player-contact-tabs" aria-label="Player contact filters">
          {tabs.map((tab) => (
            <Link
              aria-current={activeTab === tab.value ? "page" : undefined}
              className={`player-contact-tab${activeTab === tab.value ? " active" : ""}`}
              href={tab.value === "all" ? "/admin/players" : `/admin/players?contact=${tab.value}`}
              key={tab.value}
            >
              <span>{tab.label}</span>
              <strong>{tab.count}</strong>
            </Link>
          ))}
        </nav>
        <div className="report-table-wrap">
          <table className="report-table players-table">
            <thead>
              <tr>
                <th>Phone ID</th>
                <th>Name</th>
                <th>Scans</th>
                <th>Last scan</th>
                <th>Email</th>
                <th>Phone number</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {players.length ? (
                players.map((player) => (
                  <Fragment key={player.player_id}>
                    <tr
                      className={selectedPlayerId === player.player_id ? "selected-row" : undefined}
                    >
                      <td>
                        <code title={player.player_id}>{shortPlayerId(player.player_id)}</code>
                      </td>
                      <td>{player.name ?? "Not saved"}</td>
                      <td>{player.scan_count}</td>
                      <td>
                        {player.last_scan_at ? formatEasternDateTime(player.last_scan_at) : "No scans"}
                      </td>
                      <td>{player.email ?? "Not saved"}</td>
                      <td>{player.phone_number ?? "Not captured"}</td>
                      <td>
                        <button
                          className="button secondary compact-button"
                          type="button"
                          onClick={() => selectPlayer(player)}
                        >
                          {selectedPlayerId === player.player_id ? "Close" : "Edit"}
                        </button>
                      </td>
                    </tr>
                    {selectedPlayerId === player.player_id && selectedPlayer ? (
                      <tr className="player-profile-row" id="player-profile">
                        <td colSpan={7}>
                          <div className="player-profile-inline" aria-live="polite">
                            <div className="split player-profile-inline-head">
                              <div>
                                <p className="eyebrow">Player profile</p>
                                <h2>
                                  {selectedPlayer.name ||
                                    selectedPlayer.email ||
                                    shortPlayerId(selectedPlayer.player_id)}
                                </h2>
                              </div>
                              <button
                                className="button secondary compact-button"
                                type="button"
                                onClick={closeProfile}
                              >
                                Close
                              </button>
                            </div>
                            <div className="message-selected-player">
                              <p>
                                <code title={selectedPlayer.player_id}>
                                  {shortPlayerId(selectedPlayer.player_id)}
                                </code>{" "}
                                has {selectedPlayer.scan_count} scan
                                {selectedPlayer.scan_count === 1 ? "" : "s"}.
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

                            <form className="form compact-form" onSubmit={onContactSubmit}>
                              <label htmlFor={`profile-name-${selectedPlayer.player_id}`}>Name</label>
                              <input
                                id={`profile-name-${selectedPlayer.player_id}`}
                                autoComplete="name"
                                placeholder="Player name"
                                value={editName}
                                onChange={(event) => setEditName(event.target.value)}
                              />
                              <label htmlFor={`profile-email-${selectedPlayer.player_id}`}>Email</label>
                              <input
                                id={`profile-email-${selectedPlayer.player_id}`}
                                inputMode="email"
                                type="email"
                                autoComplete="email"
                                placeholder="player@example.com"
                                value={editEmail}
                                onChange={(event) => setEditEmail(event.target.value)}
                              />
                              <label htmlFor={`profile-phone-${selectedPlayer.player_id}`}>
                                Phone number
                              </label>
                              <input
                                id={`profile-phone-${selectedPlayer.player_id}`}
                                inputMode="tel"
                                type="tel"
                                autoComplete="tel"
                                placeholder="(978) 555-0100"
                                value={editPhone}
                                onChange={(event) => setEditPhone(event.target.value)}
                              />
                              <button
                                className="button secondary"
                                disabled={editStatus === "saving"}
                                type="submit"
                              >
                                {editStatus === "saving" ? "Saving..." : "Save profile"}
                              </button>
                            </form>

                            {editMessage ? (
                              <div className={editStatus === "error" ? "notice error" : "notice"}>
                                <p>{editMessage}</p>
                              </div>
                            ) : null}

                            <div className="player-recovery-actions">
                              <form className="form compact-form" onSubmit={onRecoveryEmailSubmit}>
                                <p className="eyebrow">Recovery email</p>
                                <p className="form-note">
                                  Sends the same one-tap recovery email used by the current support tool.
                                </p>
                                <button
                                  className="button primary"
                                  disabled={!savedEmail || emailStatus === "sending"}
                                  type="submit"
                                >
                                  {emailStatus === "sending" ? "Sending..." : "Send recovery email"}
                                </button>
                              </form>

                              <div className="compact-form">
                                <p className="eyebrow">Recovery SMS</p>
                                <p className="form-note">
                                  Generates text you can copy and send from your SMS app.
                                </p>
                                <button
                                  className="button secondary"
                                  disabled={!savedPhone || smsStatus === "generating"}
                                  type="button"
                                  onClick={generateSmsCopy}
                                >
                                  {smsStatus === "generating" ? "Generating..." : "Copy recovery SMS"}
                                </button>
                              </div>
                            </div>

                            {emailMessage ? (
                              <div className={emailStatus === "error" ? "notice error" : "notice"}>
                                <p>{emailMessage}</p>
                              </div>
                            ) : null}

                            {smsMessage ? (
                              <div className={smsStatus === "error" ? "notice error" : "notice"}>
                                <p>{smsMessage}</p>
                              </div>
                            ) : null}

                            {smsCopy ? (
                              <div className="compact-form">
                                <label className="field compact-search" htmlFor="sms-copy">
                                  <span>SMS copy</span>
                                  <textarea id="sms-copy" readOnly rows={5} value={smsCopy} />
                                </label>
                                <button className="button secondary" type="button" onClick={copyPreparedSmsCopy}>
                                  Copy message
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>{getEmptyTabMessage(activeTab)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </section>
  );
}

const easternDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
});

function formatEasternDateTime(isoDate: string) {
  return easternDateTimeFormatter.format(new Date(isoDate));
}

function shortPlayerId(playerId: string) {
  return playerId.length > 12 ? `${playerId.slice(0, 8)}...` : playerId;
}

function getEmptyTabMessage(tab: PlayerContactTab) {
  if (tab === "email") {
    return "No players have saved an email yet.";
  }

  if (tab === "phone") {
    return "No players have a phone number captured yet.";
  }

  return "No player rows yet.";
}
