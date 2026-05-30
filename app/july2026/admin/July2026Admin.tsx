"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./admin.module.css";
import heroImage from "../assets/july-4-hero.png";
import lh1Image from "../assets/lake-house-1.jpeg";
import lh2ExteriorImage from "../assets/lake-house-2-exterior-front.jpeg";
import lh2KitchenImage from "../assets/lake-house-2-kitchen.jpeg";
import lh2LivingRoomImage from "../assets/lake-house-2-living-room.jpeg";
import lh3PosterImage from "../assets/lake-house-3.jpeg";
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
  "Resort Desk quick guide",
  "My Stay",
  "My Room",
  "Weekend Itinerary",
  "Houses",
  "Activities",
  "Motorized Fleet",
  "Lake Rules and Approvals",
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

const readinessItems = [
  {
    detail: "Published at /july2026 with /July2026 redirect support.",
    label: "Guest portal",
    status: "Live",
    tone: "ready"
  },
  {
    detail: "Editable Proof link and embedded reference material are available on admin.",
    label: "Admin reference",
    status: "Live",
    tone: "ready"
  },
  {
    detail: "Guest CTAs launch SMS to 781-929-4932.",
    label: "Contact Host",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "15 persistent room-key URLs with reset and regenerate controls.",
    label: "Guest links",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Admin can copy one SMS-ready packet of all current room-key links.",
    label: "Link packet",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest page now has a Resort Desk guide for room keys, host SMS, directions, and approval rules.",
    label: "Resort Desk",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Laconic, Spikey Lizard, and Laika are listed with self-contained reference images.",
    label: "Motorized fleet",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest navigation now links directly to orientation, life jacket, dock, and host-approval guidance.",
    label: "Lake rules",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "LH2 and LH3 directions are live; LH1 still needs a confirmed address.",
    label: "Directions",
    status: "Partial",
    tone: "partial"
  },
  {
    detail: "LH1, LH2, and LH3 exterior/common imagery is started; bedroom and beach/detail photos remain.",
    label: "Media set",
    status: "Partial",
    tone: "partial"
  },
  {
    detail: "Zach and Bee remain in the guest list with assignment pending.",
    label: "Room assignments",
    status: "Needed",
    tone: "needed"
  },
  {
    detail: "Current guest pages say Sunday afternoon until a precise check-out time is confirmed.",
    label: "Departure time",
    status: "Optional",
    tone: "partial"
  }
];

const assetChecklist = [
  {
    alt: "Generated July 4th lake weekend hero artwork.",
    detail: "Guest landing hero and admin background.",
    label: "Hero artwork",
    src: heroImage,
    status: "Live",
    tone: "ready"
  },
  {
    alt: "Aerial view of LH1 on a wooded peninsula.",
    detail: "Guest house profile for LH1.",
    label: "LH1 exterior",
    src: lh1Image,
    status: "Live",
    tone: "ready"
  },
  {
    alt: "LH2 front exterior with Camp Peace sign and lake view.",
    detail: "Guest house profile plus LH2 gallery.",
    label: "LH2 exterior",
    src: lh2ExteriorImage,
    status: "Live",
    tone: "ready"
  },
  {
    alt: "LH2 kitchen with canoe mounted overhead.",
    detail: "LH2 common-space gallery.",
    label: "LH2 kitchen",
    src: lh2KitchenImage,
    status: "Live",
    tone: "ready"
  },
  {
    alt: "LH2 living room with stone fireplace.",
    detail: "LH2 common-space gallery.",
    label: "LH2 living room",
    src: lh2LivingRoomImage,
    status: "Live",
    tone: "ready"
  },
  {
    alt: "Exterior of LH3 with stone siding, green roof, and patio.",
    detail: "LH3 poster and animated profile fallback.",
    label: "LH3 exterior",
    src: lh3PosterImage,
    status: "Live",
    tone: "ready"
  }
] as const;

const missingContentChecklist = [
  {
    detail: "Needed before LH1 directions can be shown.",
    label: "LH1 address",
    status: "Needed"
  },
  {
    detail: "Sunroom, Great Room 1, Grand Peninsula, South Grand Peninsula fire pit, and assigned rooms.",
    label: "LH1 interior and activity photos",
    status: "Needed"
  },
  {
    detail: "South bedroom and North bedroom photos for room-level confidence.",
    label: "LH2 bedroom photos",
    status: "Needed"
  },
  {
    detail: "Beach, primary bedroom, dining/gathering, smoothie, lunch, dinner, and brunch areas.",
    label: "LH3 beach and room photos",
    status: "Needed"
  },
  {
    detail: "Host-confirmed room placement for both guests.",
    label: "Zach and Bee assignments",
    status: "Needed"
  },
  {
    detail: "Guest pages currently say Sunday afternoon.",
    label: "Exact departure time",
    status: "Optional"
  }
] as const;

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
  const [packetCopyStatus, setPacketCopyStatus] = useState("Ready to copy");
  const packetRef = useRef<HTMLPreElement>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const boundGuestProfile = useMemo(
    () => guestAssignments.find((guest) => guest.slug === boundGuest?.slug),
    [boundGuest]
  );
  const guestLinkPacket = useMemo(() => {
    const baseUrl = origin || "https://famous.land";

    return guestAssignments
      .map((guest) => {
        const token = guestLinks[guest.slug]?.token;
        const path = `/july2026/guest/${guest.slug}${token ? `?t=${token}` : ""}`;
        const assignment = guest.house === "Pending" ? "Assignment pending" : `${guest.house} / ${guest.room}`;

        return `${guest.name}: ${assignment}\n${baseUrl}${path}`;
      })
      .join("\n\n");
  }, [guestLinks, origin]);

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

  async function copyGuestLinkPacket() {
    try {
      await navigator.clipboard.writeText(guestLinkPacket);
      setPacketCopyStatus("Copied all room-key links");
    } catch {
      const selection = window.getSelection();
      const packet = packetRef.current;

      if (selection && packet) {
        const range = document.createRange();
        range.selectNodeContents(packet);
        selection.removeAllRanges();
        selection.addRange(range);
        setPacketCopyStatus("Copy blocked; packet selected");
        return;
      }

      setPacketCopyStatus("Copy blocked; select the packet manually");
    }
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

        <section className={styles.readinessSection} aria-label="July 2026 readiness tracker">
          <div className={styles.proofHeader}>
            <div>
              <span className={styles.label}>Readiness</span>
              <h2>Launch Checklist</h2>
              <p>
                Current operating view for what is live, what is partial, and what still needs host
                confirmation before the guest experience is final.
              </p>
            </div>
          </div>
          <div className={styles.readinessGrid}>
            {readinessItems.map((item) => (
              <article className={styles[item.tone as "ready" | "partial" | "needed"]} key={item.label}>
                <div>
                  <span>{item.status}</span>
                  <strong>{item.label}</strong>
                </div>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.assetSection} aria-label="July 2026 media and content checklist">
          <div className={styles.proofHeader}>
            <div>
              <span className={styles.label}>Media</span>
              <h2>Asset and Content Checklist</h2>
              <p>
                Current media bundled with the July 2026 experience, plus the host-supplied photos
                and details still needed for a fully polished guest launch.
              </p>
            </div>
          </div>
          <div className={styles.assetGrid}>
            {assetChecklist.map((item) => (
              <article key={item.label}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  className={styles.assetImage}
                  sizes="(max-width: 980px) 100vw, 210px"
                />
                <div>
                  <span className={styles.readyBadge}>{item.status}</span>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.contentGapGrid}>
            {missingContentChecklist.map((item) => (
              <article key={item.label}>
                <span className={item.status === "Optional" ? styles.optionalBadge : styles.neededBadge}>
                  {item.status}
                </span>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.vehicleInventorySection} id="fleet-inventory" aria-label="Motorized vehicle inventory">
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
                        <dt>Class</dt>
                        <dd>{vehicle.length}</dd>
                      </div>
                      <div>
                        <dt>Capacity</dt>
                        <dd>{vehicle.capacity}</dd>
                      </div>
                      <div>
                        <dt>Image source</dt>
                        <dd>{vehicle.source}</dd>
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
          <div className={styles.linkPacket}>
            <div>
              <span className={styles.label}>Share Packet</span>
              <h3>All room-key links</h3>
              <p>
                SMS-ready list with current tokenized links when available. Regenerate or reset
                individual guests below, then copy this packet for host outreach.
              </p>
            </div>
            <button type="button" onClick={copyGuestLinkPacket}>
              Copy packet
            </button>
            <span className={styles.packetStatus}>{packetCopyStatus}</span>
            <pre ref={packetRef}>{guestLinkPacket}</pre>
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
