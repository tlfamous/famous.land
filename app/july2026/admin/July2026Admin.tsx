"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";
import laconicVehicleImage from "../assets/vehicle-laconic-switch.png";
import laikaVehicleImage from "../assets/vehicle-laika-trixx.png";
import spikeyLizardVehicleImage from "../assets/vehicle-spikey-lizard-gtx.png";
import { guestAssignments, motorizedVehicles } from "../data";
import { referenceMaterial } from "./referenceMaterial";

const proofUrl = "https://www.proofeditor.ai/d/ado6gf4r?token=2b8510d8-4eaa-4fc9-b0e7-f802f6a0d12c";

const adminTools = [
  "Guest list with assigned house and room",
  "First-device identity binding status",
  "Generate or regenerate guest links",
  "Reset the current device binding if needed",
  "Track missing photos, addresses, and room-assignment decisions"
];

const guestExperience = [
  "Welcome / Check-In",
  "My Stay",
  "My Room",
  "Weekend Itinerary",
  "Houses",
  "Activities",
  "Motorized Fleet",
  "Food and Drinks",
  "Maps and Directions",
  "Contact Host",
  "View Other Guests"
];

const contentNeeds = [
  "LH1 address",
  "House and room photos",
  "Exact departure or check-out time",
  "Zach and Bee room assignments"
];

const vehicleImages = {
  laconic: {
    alt: "Red Sea-Doo Switch pontoon reference for Laconic.",
    src: laconicVehicleImage
  },
  laika: {
    alt: "Red Sea-Doo Trixx reference for Laika.",
    src: laikaVehicleImage
  },
  "spikey-lizard": {
    alt: "Blue Sea-Doo GTX PWC reference for Spikey Lizard.",
    src: spikeyLizardVehicleImage
  }
} as const;

const bindingStorageKey = "famous.land.july2026.boundGuest";

type BoundGuest = {
  slug: string;
  token?: string;
  boundAt: string;
};

type GuestLinkRecord = {
  slug: string;
  token: string;
  bound?: boolean;
  bound_at?: string;
  updated_at?: string;
};

export function July2026Admin() {
  const [guestLinks, setGuestLinks] = useState<Record<string, GuestLinkRecord>>({});
  const [boundGuest, setBoundGuest] = useState<BoundGuest | null>(null);
  const [linkStatus, setLinkStatus] = useState("Loading guest links");
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

  async function updateGuestLink(slug: string, action: "regenerate" | "reset") {
    setLinkStatus(action === "regenerate" ? "Regenerating link" : "Resetting binding");

    try {
      const response = await fetch("/api/july2026/guest-links", {
        body: JSON.stringify({ action, slug }),
        headers: {
          "content-type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json()) as { ok?: boolean; link?: GuestLinkRecord };

      if (response.ok && result.ok && result.link) {
        setGuestLinks((links) => ({
          ...links,
          [slug]: result.link as GuestLinkRecord
        }));
        setLinkStatus(action === "regenerate" ? "Fresh link generated" : "Guest binding reset");
        return;
      }

      setLinkStatus("Guest-link update failed");
    } catch {
      setLinkStatus("Guest-link service unavailable");
    }
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

        <section className={styles.vehicleInventorySection} aria-label="Motorized vehicle inventory">
          <div className={styles.proofHeader}>
            <div>
              <span className={styles.label}>Inventory</span>
              <h2>Motorized Vehicles</h2>
              <p>
                Self-contained reference images and working names for the lake fleet. All motorized
                use requires host approval after orientation.
              </p>
            </div>
          </div>
          <div className={styles.vehicleInventoryGrid}>
            {motorizedVehicles.map((vehicle) => {
              const vehicleImage = vehicleImages[vehicle.image as keyof typeof vehicleImages];

              return (
                <article key={vehicle.name}>
                  <Image
                    src={vehicleImage.src}
                    alt={vehicleImage.alt}
                    className={styles.vehicleInventoryImage}
                    sizes="(max-width: 980px) 100vw, 360px"
                  />
                  <div>
                    <strong>{vehicle.name}</strong>
                    <span>{vehicle.type}</span>
                    <dl>
                      <div>
                        <dt>Reference</dt>
                        <dd>{vehicle.model}</dd>
                      </div>
                      <div>
                        <dt>Color</dt>
                        <dd>{vehicle.color}</dd>
                      </div>
                      <div>
                        <dt>Capacity</dt>
                        <dd>{vehicle.capacity}</dd>
                      </div>
                    </dl>
                    <p>{vehicle.detail}</p>
                  </div>
                </article>
              );
            })}
          </div>
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
          <div className={styles.bindingStatus}>
            <strong>Persistent link service</strong>
            <span>{linkStatus}</span>
          </div>
          <div className={styles.guestLinkGrid}>
            {guestAssignments.map((guest) => {
              const token = guestLinks[guest.slug]?.token;
              const path = `/july2026/guest/${guest.slug}${token ? `?t=${token}` : ""}`;
              const href = `${origin}${path}`;
              const boundAt = guestLinks[guest.slug]?.bound_at;

              return (
                <article key={guest.slug}>
                  <div>
                    <strong>{guest.name}</strong>
                    <span>{guest.house === "Pending" ? "Assignment pending" : `${guest.house} / ${guest.room}`}</span>
                    <span>{boundAt ? `Bound ${new Date(boundAt).toLocaleString()}` : "Not bound yet"}</span>
                    <code>{path}</code>
                  </div>
                  <div className={styles.guestLinkActions}>
                    <a href={path}>Open</a>
                    <button type="button" onClick={() => updateGuestLink(guest.slug, "regenerate")}>
                      Regenerate
                    </button>
                    <button type="button" onClick={() => updateGuestLink(guest.slug, "reset")}>
                      Reset
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
