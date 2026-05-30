"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";
import { guestAssignments } from "../data";
import { referenceMaterial } from "./referenceMaterial";

const proofUrl = "https://www.proofeditor.ai/d/ado6gf4r?token=2b8510d8-4eaa-4fc9-b0e7-f802f6a0d12c";

const adminTools = [
  "Guest list with assigned house and room",
  "First-device identity binding status",
  "Generate or regenerate guest links",
  "Reset the current device binding if needed",
  "Track missing photos, addresses, dietary notes, and activity decisions"
];

const guestExperience = [
  "Welcome / Check-In",
  "My Stay",
  "My Room",
  "Weekend Itinerary",
  "Houses",
  "Activities",
  "Food and Drinks",
  "Maps and Directions",
  "Contact Host",
  "View Other Guests"
];

const contentNeeds = [
  "LH1 address",
  "House and room photos",
  "Exact departure or check-out time",
  "Dietary notes and restrictions",
  "Boat, cruise, and quad reservation rules"
];

const bindingStorageKey = "famous.land.july2026.boundGuest";

type BoundGuest = {
  slug: string;
  token?: string;
  boundAt: string;
};

function createGuestToken() {
  const bytes = new Uint8Array(8);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function July2026Admin() {
  const [generatedTokens, setGeneratedTokens] = useState<Record<string, string>>({});
  const [boundGuest, setBoundGuest] = useState<BoundGuest | null>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const boundGuestProfile = useMemo(
    () => guestAssignments.find((guest) => guest.slug === boundGuest?.slug),
    [boundGuest]
  );

  useEffect(() => {
    try {
      const storedBinding = window.localStorage.getItem(bindingStorageKey);
      setBoundGuest(storedBinding ? (JSON.parse(storedBinding) as BoundGuest) : null);
    } catch {
      setBoundGuest(null);
    }
  }, []);

  function regenerateGuestLink(slug: string) {
    setGeneratedTokens((tokens) => ({
      ...tokens,
      [slug]: createGuestToken()
    }));
  }

  function resetLocalBinding() {
    window.localStorage.removeItem(bindingStorageKey);
    setBoundGuest(null);
  }

  return (
    <div className="july-2026-app">
      <div className={styles.adminPage}>
        <header className={styles.hero}>
          <div>
            <a className={styles.backLink} href="/july2026">
              Guest experience
            </a>
            <h1>July 4th, 2026 Admin</h1>
            <p>
              Editable reference material and planning controls for the famous.land resort-style
              lake weekend guest portal.
            </p>
          </div>
          <a className={styles.proofButton} href={proofUrl} target="_blank" rel="noreferrer">
            Open Editable Proof
          </a>
        </header>

        <section className={styles.grid} aria-label="Admin planning summary">
          <article className={styles.panel}>
            <span className={styles.label}>Build target</span>
            <h2>Guest resort portal</h2>
            <p>
              Personalized links should open to each guest's assigned lake house, room, weekend
              itinerary, activity options, map context, and host help.
            </p>
          </article>

          <article className={styles.panel}>
            <span className={styles.label}>Contact Host</span>
            <h2>Mobile text action</h2>
            <p>
              Guest-facing contact buttons should launch a message to{" "}
              <a href="sms:+17819294932">781-929-4932</a>.
            </p>
          </article>

          <article className={styles.panel}>
            <span className={styles.label}>Editable source</span>
            <h2>Proof reference doc</h2>
            <p>
              The document below is the live editable source for requirements, room assignments,
              schedule details, activity lists, and missing content.
            </p>
          </article>
        </section>

        <section className={styles.lists} aria-label="Reference checkpoints">
          <article className={styles.panel}>
            <h2>Admin Tools</h2>
            <ul>
              {adminTools.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <h2>Guest Sections</h2>
            <ul>
              {guestExperience.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <h2>Content Needs</h2>
            <ul>
              {contentNeeds.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className={styles.guestLinksSection} aria-label="Personalized guest links">
          <div className={styles.proofHeader}>
            <div>
              <span className={styles.label}>Guest Links</span>
              <h2>Personalized room-key URLs</h2>
              <p>
                Generate fresh token-style links for guest testing. The first guest opened on a
                device is remembered locally and later guest links do not overwrite that check-in.
              </p>
            </div>
            <button className={styles.localResetButton} type="button" onClick={resetLocalBinding}>
              Reset this device
            </button>
          </div>
          <div className={styles.bindingStatus}>
            <strong>Current device binding</strong>
            <span>
              {boundGuestProfile
                ? `${boundGuestProfile.name} since ${new Date(boundGuest?.boundAt ?? "").toLocaleString()}`
                : "No guest bound on this device yet"}
            </span>
          </div>
          <div className={styles.guestLinkGrid}>
            {guestAssignments.map((guest) => {
              const token = generatedTokens[guest.slug];
              const path = `/july2026/guest/${guest.slug}${token ? `?t=${token}` : ""}`;
              const href = `${origin}${path}`;

              return (
                <article key={guest.slug}>
                  <div>
                    <strong>{guest.name}</strong>
                    <span>{guest.house === "Pending" ? "Assignment pending" : `${guest.house} / ${guest.room}`}</span>
                    <code>{path}</code>
                  </div>
                  <div className={styles.guestLinkActions}>
                    <a href={path}>Open</a>
                    <button type="button" onClick={() => regenerateGuestLink(guest.slug)}>
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(href);
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.proofSection} aria-label="Editable Proof reference material">
          <div className={styles.proofHeader}>
            <div>
              <span className={styles.label}>Reference Material</span>
              <h2>Lake Weekend Guest Website Reference Document</h2>
              <p>Shown here for quick review. Use Proof for edits and collaborative updates.</p>
            </div>
            <a href={proofUrl} target="_blank" rel="noreferrer">
              Edit in Proof
            </a>
          </div>
          <pre className={styles.referenceText}>{referenceMaterial}</pre>
        </section>
      </div>
    </div>
  );
}
