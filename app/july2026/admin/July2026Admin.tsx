"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";
import { getGuestSmsPacket, guestAssignments } from "../data";
import { copyTextToClipboard } from "@/components/copyTextToClipboard";

const bindingStorageKey = "famous.land.july2026.boundGuest";

type GuestLinkRecord = {
  slug: string;
  token: string;
  bound?: boolean;
  bound_at?: string;
  updated_at?: string;
};

function getAdminGuestPreviewPath(path: string) {
  return path.includes("?") ? `${path}&preview=admin` : `${path}?preview=admin`;
}

export function July2026Admin() {
  const [guestLinks, setGuestLinks] = useState<Record<string, GuestLinkRecord>>({});
  const [linkStatus, setLinkStatus] = useState("Loading guest links");
  const [guestCopyStatus, setGuestCopyStatus] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState("https://famous.land");

  useEffect(() => {
    setOrigin(window.location.origin);

    try {
      window.localStorage.removeItem(bindingStorageKey);
    } catch {
      // Ignore localStorage failures; admin previews must never rely on guest binding state.
    }

    void refreshGuestLinks();
  }, []);

  async function refreshGuestLinks() {
    try {
      const response = await fetch("/api/july2026/guest-links");
      const result = (await response.json()) as { ok?: boolean; links?: GuestLinkRecord[] };

      if (result.ok && result.links) {
        setGuestLinks(Object.fromEntries(result.links.map((link) => [link.slug, link])));
        setLinkStatus("Persistent guest links loaded");
        return;
      }

      setLinkStatus("Guest-link service did not return links");
    } catch {
      setLinkStatus("Guest-link service unavailable");
    }
  }

  async function copyGuestSmsPacket(guest: (typeof guestAssignments)[number], path: string) {
    if (await copyTextToClipboard(getGuestSmsPacket(guest, path, origin || "https://famous.land"))) {
      setGuestCopyStatus((statuses) => ({
        ...statuses,
        [guest.slug]: "Copied SMS packet"
      }));
      return;
    }

    setGuestCopyStatus((statuses) => ({
      ...statuses,
      [guest.slug]: "Copy blocked"
    }));
  }

  return (
    <div className="july-2026-app">
      <div className={styles.adminPage}>
        <header className={styles.adminHeader}>
          <h1>July 4th, 2026 Admin</h1>
          <a className={styles.backLink} href="/july2026">
            Guest experience
          </a>
        </header>

        <section className={styles.guestLinksSection} id="guest-links" aria-label="Guest List">
          <div className={styles.guestListHeader}>
            <h2>Guest List</h2>
            <span>{linkStatus}</span>
          </div>
          <div className={styles.guestStatusTableWrap}>
            <table className={styles.guestStatusTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile phone</th>
                  <th>Email</th>
                  <th>Invite</th>
                  <th>Linked</th>
                  <th>Checked in</th>
                </tr>
              </thead>
              <tbody>
                {guestAssignments.map((guest) => {
                  const boundAt = guestLinks[guest.slug]?.bound_at;
                  const token = guestLinks[guest.slug]?.token;
                  const path = `/july2026/guest/${guest.slug}${token ? `?t=${token}` : ""}`;
                  const previewPath = getAdminGuestPreviewPath(path);
                  const inviteText = getGuestSmsPacket(guest, path, origin || "https://famous.land");

                  return (
                    <tr key={guest.slug}>
                      <td>{guest.name}</td>
                      <td>
                        {guest.phoneNumber ? <a href={`tel:${guest.phoneNumber}`}>{guest.phoneNumber}</a> : "TBD"}
                      </td>
                      <td>{guest.email ? <a href={`mailto:${guest.email}`}>{guest.email}</a> : "TBD"}</td>
                      <td>
                        <div className={styles.guestInviteActions}>
                          <button type="button" onClick={() => copyGuestSmsPacket(guest, path)}>
                            Copy invite
                          </button>
                          <details className={styles.invitePreview}>
                            <summary>Preview invite</summary>
                            <pre>{inviteText}</pre>
                          </details>
                          <a href={previewPath} target="_blank" rel="noreferrer">
                            Guest page
                          </a>
                          <span>{guestCopyStatus[guest.slug] ?? "Ready"}</span>
                        </div>
                      </td>
                      <td>{token ? "Link ready" : "Not linked"}</td>
                      <td>{boundAt ? `Checked in ${new Date(boundAt).toLocaleString()}` : "Not checked in"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
