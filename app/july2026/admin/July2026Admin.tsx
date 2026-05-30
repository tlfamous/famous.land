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
import lh3ProfileGif from "../assets/lh3-profile.gif";
import laconicVehicleImage from "../assets/vehicle-laconic-switch.png";
import laikaVehicleImage from "../assets/vehicle-laika-trixx.png";
import spikeyLizardVehicleImage from "../assets/vehicle-spikey-lizard-gtx.png";
import {
  getGuestQrPath,
  getGuestSmsPacket,
  getLaunchCompletionRequestText,
  guestAssignments,
  hostSmsHref,
  launchCompletionItems,
  motorizedVehicles
} from "../data";
import { referenceMaterial } from "./referenceMaterial";

const proofUrl = "https://www.proofeditor.ai/d/ado6gf4r?token=2b8510d8-4eaa-4fc9-b0e7-f802f6a0d12c";

const adminTools = [
  "Guest list with assigned house and room",
  "First-device identity binding status",
  "Generate or regenerate guest links",
  "Reset the current device binding if needed",
  "Copy guest-specific SMS packets",
  "Review printable guest SMS packets",
  "Review day-of host text templates",
  "Copy missing-content request packet",
  "Print media shot list",
  "Track missing photos, addresses, and room-assignment decisions"
];

const guestExperience = [
  "Welcome / Check-In",
  "Resort Desk quick guide",
  "Day-Of Desk",
  "Arrival checklist",
  "Resort FAQ",
  "Rain Plan",
  "Host text templates",
  "House Directory",
  "Guest Registry",
  "Add Calendar",
  "Save Host Contact",
  "Offline Guide",
  "My Stay",
  "My Room",
  "Weekend Itinerary",
  "Meals and Coffee",
  "Houses",
  "Activities",
  "Motorized Fleet",
  "Lake Rules and Approvals",
  "Safety Guide",
  "Food and Drinks",
  "Resort Map",
  "Maps and Directions",
  "Getting Around guide",
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
    detail: "Admin can copy a launch-completion request for the remaining host-supplied address, room, photo, and checkout details.",
    label: "Content request",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Each guest row can copy a personalized SMS packet with assignment, room-key link, calendar, guide, host contact, and arrival notes.",
    label: "Guest SMS packets",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Admin includes a print-friendly review sheet for every guest outreach SMS.",
    label: "SMS review sheet",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Admin includes print-friendly day-of host broadcast templates for arrival, movement, fleet, meals, fireworks, and help.",
    label: "Host text templates",
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
    detail: "Guest-facing day-of desk centralizes arrival, room keys, weather pivots, lake approvals, meals, maps, and host texts.",
    label: "Day-Of Desk",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest page includes an Arrival Desk checklist plus one-tap SMS templates for room help, dietary notes, fleet approval, and link resets.",
    label: "Arrival Desk",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest-facing FAQ collects arrival, directions, food, lake approvals, phone setup, and host-help answers.",
    label: "Resort FAQ",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest-facing rain plan explains host updates, indoor pivots, lake-safety holds, meals, fireworks, and phone backup.",
    label: "Rain Plan",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest CTAs download a self-contained weekend .ics file from /july2026/calendar.ics.",
    label: "Calendar file",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Each guest room-key page exposes a personal .ics file with their assignment, packet link, room-key URL, and host SMS line.",
    label: "Personal calendars",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest CTAs download a host vCard from /july2026/host-contact.vcf with the SMS line and event URL.",
    label: "Host contact card",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest CTAs download a plain-text weekend guide from /july2026/weekend-guide.txt for offline use.",
    label: "Offline guide",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest room-key pages show house-specific itinerary highlights for LH1, LH2, LH3, and pending assignments.",
    label: "Personal itinerary",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest-facing meals guide centralizes welcome food, house coffee, smoothies, lunch, lakeside patio dinner, brunch, and dietary-note texting.",
    label: "Meals guide",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest-facing resort map shows LH1/LH2/LH3 roles, lake movement, food hubs, and activity anchors.",
    label: "Resort map",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest map section explains arrival, Friday LH1 flow, Saturday LH3 flow, and the LH1-to-LH3 boat connection.",
    label: "Getting around",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest-facing standalone directory shows LH1, LH2, and LH3 rooms, guests, photos, directions status, and house-specific highlights.",
    label: "House directory",
    status: "Ready",
    tone: "ready"
  },
  {
    detail: "Guest-facing registry shows house rosters, room assignments, companions, pending assignments, and room-key links.",
    label: "Guest registry",
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
    detail: "Guest-facing safety guide centralizes emergency-first guidance, host approvals, lake rules, life jackets, and dock movement.",
    label: "Safety guide",
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
    detail: "Printable shot list is available for the remaining LH1, LH2, and LH3 media capture.",
    label: "Media shot list",
    status: "Ready",
    tone: "ready"
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
    detail: "LH3 poster and MP4 fallback.",
    label: "LH3 exterior",
    src: lh3PosterImage,
    status: "Live",
    tone: "ready"
  },
  {
    alt: "Animated aerial profile of LH3, showing the patio and lakeside setting.",
    detail: "Self-contained animated GIF profile made from the LH3 drone video.",
    label: "LH3 animated profile",
    src: lh3ProfileGif,
    status: "Live",
    tone: "ready",
    unoptimized: true
  }
] as const;

const vehicleImages = {
  laconic: {
    alt: "Red Sea-Doo Switch pontoon reference for Laconic.",
    src: laconicVehicleImage
  },
  laika: {
    alt: "Red Sea-Doo Spark Trixx reference for Laika.",
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
  const [contentRequestStatus, setContentRequestStatus] = useState("Ready to copy");
  const [guestCopyStatus, setGuestCopyStatus] = useState<Record<string, string>>({});
  const packetRef = useRef<HTMLPreElement>(null);
  const contentRequestRef = useRef<HTMLPreElement>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const baseUrl = origin || "https://famous.land";
  const launchReviewLinks = useMemo(
    () => [
      {
        detail: "Primary guest experience.",
        href: `${baseUrl}/july2026`,
        label: "Guest portal"
      },
      {
        detail: "Mobile day-of operations hub for arrival, weather, meals, lake approvals, maps, and host texts.",
        href: `${baseUrl}/july2026/day-of`,
        label: "Day-Of Desk"
      },
      {
        detail: "Proof-backed reference and admin controls.",
        href: `${baseUrl}/july2026/admin`,
        label: "Admin reference"
      },
      {
        detail: "Mobile-friendly resort pass with QR, host SMS, calendar, offline guide, and pocket itinerary.",
        href: `${baseUrl}/july2026/pass`,
        label: "Resort pass"
      },
      {
        detail: "Quick guest answers for arrival, directions, food, lake approvals, phone setup, and host help.",
        href: `${baseUrl}/july2026/faq`,
        label: "Resort FAQ"
      },
      {
        detail: "Weather backup guidance for host updates, indoor pivots, lake holds, meals, fireworks, and phone setup.",
        href: `${baseUrl}/july2026/rain-plan`,
        label: "Rain plan"
      },
      {
        detail: "Plain-text offline guest guide.",
        href: `${baseUrl}/july2026/weekend-guide.txt`,
        label: "Weekend guide"
      },
      {
        detail: "Public one-page arrival guide with QR, host line, check-in flow, and key schedule.",
        href: `${baseUrl}/july2026/arrival-card`,
        label: "Arrival card"
      },
      {
        detail: "Public resort map for house flow, lake route, gathering hubs, meal locations, and activity anchors.",
        href: `${baseUrl}/july2026/map`,
        label: "Resort map"
      },
      {
        detail: "Public house movement page with live LH2/LH3 maps and LH1 pending-address fallback.",
        href: `${baseUrl}/july2026/directions`,
        label: "Directions hub"
      },
      {
        detail: "Standalone LH1/LH2/LH3 directory with photos, rooms, guests, house roles, and direction status.",
        href: `${baseUrl}/july2026/houses`,
        label: "House directory"
      },
      {
        detail: "Standalone guest registry with house rosters, room assignments, companions, pending guests, and room-key links.",
        href: `${baseUrl}/july2026/guest-list`,
        label: "Guest registry"
      },
      {
        detail: "Public help desk with host text prompts, approvals, lake rules, and self-service links.",
        href: `${baseUrl}/july2026/concierge`,
        label: "Guest concierge"
      },
      {
        detail: "Public packing and pre-arrival checklist with provided logistics and phone setup reminders.",
        href: `${baseUrl}/july2026/prep`,
        label: "Packing prep"
      },
      {
        detail: "Public print/screenshot-friendly run of show grouped by weekend day.",
        href: `${baseUrl}/july2026/itinerary`,
        label: "Weekend itinerary"
      },
      {
        detail: "Public meals and coffee guide with food moments, house coffee, and dietary-note text action.",
        href: `${baseUrl}/july2026/meals`,
        label: "Meals and coffee"
      },
      {
        detail: "Guest-facing motorized vehicle inventory with approval guidance and self-contained images.",
        href: `${baseUrl}/july2026/fleet`,
        label: "Fleet guide"
      },
      {
        detail: "Emergency-first guidance, lake rules, life jackets, dock plan, and host approval notes.",
        href: `${baseUrl}/july2026/safety`,
        label: "Safety guide"
      },
      {
        detail: "Downloadable shared weekend calendar.",
        href: `${baseUrl}/july2026/calendar.ics`,
        label: "Weekend calendar"
      },
      {
        detail: "Downloadable host contact card.",
        href: `${baseUrl}/july2026/host-contact.vcf`,
        label: "Host contact"
      },
      {
        detail: "Downloadable packet for the remaining host-supplied content.",
        href: `${baseUrl}/july2026/admin/missing-content.txt`,
        label: "Missing-content request"
      },
      {
        detail: "Plain-text current launch state with ready surfaces, caveats, and host-confirmation blockers.",
        href: `${baseUrl}/july2026/admin/status.txt`,
        label: "Launch status"
      },
      {
        detail: "Print-friendly review sheet for every guest room-key SMS packet.",
        href: `${baseUrl}/july2026/admin/sms-packets`,
        label: "Guest SMS packets"
      },
      {
        detail: "Print-friendly day-of host broadcast templates for guest operations.",
        href: `${baseUrl}/july2026/admin/host-texts`,
        label: "Host text templates"
      },
      {
        detail: "Print-friendly shot list for remaining house, room, and event-location photos.",
        href: `${baseUrl}/july2026/admin/media-shot-list`,
        label: "Media shot list"
      },
      {
        detail: "Print-friendly guest room-key links and QR codes.",
        href: `${baseUrl}/july2026/admin/room-keys`,
        label: "Printable room keys"
      },
      {
        detail: "Print-friendly host run of show, food, lake rules, and text prompts.",
        href: `${baseUrl}/july2026/admin/briefing-sheet`,
        label: "Host briefing sheet"
      },
      {
        detail: "Print-ready LH1, LH2, and LH3 signs with portal QR and host text line.",
        href: `${baseUrl}/july2026/admin/house-signs`,
        label: "House signs"
      },
      {
        detail: "Sample personalized room key for QA.",
        href: `${baseUrl}/july2026/guest/holly`,
        label: "Sample room key"
      },
      {
        detail: "Sample pending-assignment room key for QA.",
        href: `${baseUrl}/july2026/guest/zach`,
        label: "Pending room key"
      }
    ],
    [baseUrl]
  );
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
  const contentRequestPacket = useMemo(() => {
    return getLaunchCompletionRequestText(baseUrl);
  }, [baseUrl]);

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

  async function copyContentRequestPacket() {
    try {
      await navigator.clipboard.writeText(contentRequestPacket);
      setContentRequestStatus("Copied missing-content request");
    } catch {
      const selection = window.getSelection();
      const packet = contentRequestRef.current;

      if (selection && packet) {
        const range = document.createRange();
        range.selectNodeContents(packet);
        selection.removeAllRanges();
        selection.addRange(range);
        setContentRequestStatus("Copy blocked; request selected");
        return;
      }

      setContentRequestStatus("Copy blocked; select the request manually");
    }
  }

  async function copyGuestSmsPacket(guest: (typeof guestAssignments)[number], path: string) {
    try {
      await navigator.clipboard.writeText(getGuestSmsPacket(guest, path, origin || "https://famous.land"));
      setGuestCopyStatus((statuses) => ({
        ...statuses,
        [guest.slug]: "Copied SMS packet"
      }));
    } catch {
      setGuestCopyStatus((statuses) => ({
        ...statuses,
        [guest.slug]: "Copy blocked"
      }));
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
              <a href={hostSmsHref}>781-929-4932</a>.
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
                  unoptimized={"unoptimized" in item ? item.unoptimized : false}
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
            {launchCompletionItems.map((item) => (
              <article key={item.label}>
                <span className={item.status === "Optional" ? styles.optionalBadge : styles.neededBadge}>
                  {item.status}
                </span>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
          <div className={styles.contentRequestPacket}>
            <div>
              <span className={styles.label}>Host Request</span>
              <h3>Launch completion packet</h3>
              <p>
                Copy this checklist when asking for the final address, assignments, photos, and
                checkout detail needed to remove the remaining pending states.
              </p>
            </div>
            <button type="button" onClick={copyContentRequestPacket}>
              Copy request
            </button>
            <a href="/july2026/admin/missing-content.txt">Download .txt</a>
            <a href="/july2026/admin/status.txt">Launch status</a>
            <a href="/july2026/admin/media-shot-list">Print shot list</a>
            <span className={styles.packetStatus}>{contentRequestStatus}</span>
            <pre ref={contentRequestRef}>{contentRequestPacket}</pre>
          </div>
        </section>

        <section className={styles.launchUrlsSection} aria-label="Launch review URLs">
          <div className={styles.proofHeader}>
            <div>
              <span className={styles.label}>Launch QA</span>
              <h2>Live URLs to Review</h2>
              <p>
                Fast links for checking the published guest portal, admin reference, downloads, and
                the two room-key states guests can see.
              </p>
            </div>
          </div>
          <div className={styles.launchUrlGrid}>
            {launchReviewLinks.map((item) => (
              <a href={item.href} key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.href}</span>
                <p>{item.detail}</p>
              </a>
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
                        <dt>Best for</dt>
                        <dd>{vehicle.bestFor}</dd>
                      </div>
                      <div>
                        <dt>Start point</dt>
                        <dd>{vehicle.pickup}</dd>
                      </div>
                      <div>
                        <dt>Approval</dt>
                        <dd>{vehicle.approval}</dd>
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
                        <dd>
                          <a href={vehicle.sourceUrl}>{vehicle.source}</a>
                        </dd>
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
            <a href="/july2026/admin/room-keys">Print room keys</a>
            <a href="/july2026/admin/sms-packets">Review SMS</a>
            <a href="/july2026/admin/host-texts">Host texts</a>
            <a href="/july2026/admin/media-shot-list">Print shot list</a>
            <a href="/july2026/admin/briefing-sheet">Print briefing</a>
            <a href="/july2026/admin/house-signs">Print house signs</a>
            <span className={styles.packetStatus}>{packetCopyStatus}</span>
            <pre ref={packetRef}>{guestLinkPacket}</pre>
          </div>
          <div className={styles.guestLinkGrid}>
            {guestAssignments.map((guest) => {
              const token = guestLinks[guest.slug]?.token;
              const path = `/july2026/guest/${guest.slug}${token ? `?t=${token}` : ""}`;
              const href = `${origin}${path}`;
              const qrPath = getGuestQrPath(guest, path);
              const boundAt = guestLinks[guest.slug]?.bound_at;
              const smsPacket = getGuestSmsPacket(guest, path);

              return (
                <article key={guest.slug}>
                  <div>
                    <strong>{guest.name}</strong>
                    <span>{guest.house === "Pending" ? "Assignment pending" : `${guest.house} / ${guest.room}`}</span>
                    <span>{boundAt ? `Bound ${new Date(boundAt).toLocaleString()}` : "Not bound yet"}</span>
                    <code>{path}</code>
                  </div>
                  <div className={styles.guestQrPreview}>
                    <img src={qrPath} alt={`${guest.name} room-key QR code`} />
                    <div>
                      <strong>Room-key QR</strong>
                      <span>{qrPath}</span>
                    </div>
                  </div>
                  <div className={styles.guestLinkActions}>
                    <a href={path}>Open</a>
                    <a href={qrPath}>Open QR</a>
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
                    <button type="button" onClick={() => copyGuestSmsPacket(guest, path)}>
                      Copy SMS
                    </button>
                  </div>
                  <span className={styles.guestCopyStatus}>{guestCopyStatus[guest.slug] ?? "SMS packet ready"}</span>
                  <details className={styles.guestSmsPreview}>
                    <summary>Preview SMS packet</summary>
                    <pre>{smsPacket}</pre>
                  </details>
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
