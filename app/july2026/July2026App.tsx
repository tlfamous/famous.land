"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import heroImage from "./assets/july-4-hero.png";
import lakeHouse1Image from "./assets/lake-house-1.jpeg";
import lakeHouse2ExteriorFrontImage from "./assets/lake-house-2-exterior-front.jpeg";
import lakeHouse2ExteriorSideImage from "./assets/lake-house-2-exterior-side.jpeg";
import lakeHouse2KitchenImage from "./assets/lake-house-2-kitchen.jpeg";
import lakeHouse2LivingRoomImage from "./assets/lake-house-2-living-room.jpeg";
import lakeHouse3Image from "./assets/lake-house-3.jpeg";
import laconicVehicleImage from "./assets/vehicle-laconic-switch.png";
import laikaVehicleImage from "./assets/vehicle-laika-trixx.png";
import spikeyLizardVehicleImage from "./assets/vehicle-spikey-lizard-gtx.png";
import {
  activityItems,
  arrivalChecklistItems,
  bringItems,
  foodMoments,
  guestAssignments,
  hostHelpItems,
  hostTextTemplates,
  houseProfiles,
  itineraryHighlights,
  lakeUseRules,
  motorizedVehicles,
  resortDeskItems,
  scheduleItems,
  statusItems,
  transitGuideItems
} from "./data";
import styles from "./july2026.module.css";

const lakeHouse3Video = new URL("./assets/lh3-profile.mp4", import.meta.url).toString();

function Icon({ path }: { path: string }) {
  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  );
}

const houseImages = {
  "lake-house-1": {
    alt: "Aerial view of LH1 on a wooded peninsula.",
    label: "LH1",
    src: lakeHouse1Image
  },
  "lake-house-2": {
    alt: "LH2 exterior with Camp Peace sign and lake view.",
    gallery: [
      {
        alt: "LH2 side exterior above the lake.",
        src: lakeHouse2ExteriorSideImage
      },
      {
        alt: "LH2 kitchen with a canoe mounted overhead.",
        src: lakeHouse2KitchenImage
      },
      {
        alt: "LH2 living room with stone fireplace.",
        src: lakeHouse2LivingRoomImage
      }
    ],
    label: "LH2",
    src: lakeHouse2ExteriorFrontImage
  },
  "lake-house-3": {
    alt: "Exterior of LH3 with stone siding, green roof, and patio.",
    label: "LH3",
    src: lakeHouse3Image,
    videoSrc: lakeHouse3Video
  }
} as const;

const vehicleImages = {
  laconic: {
    alt: "Red Sea-Doo Switch pontoon boat reference for Laconic.",
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

type July2026AppProps = {
  selectedGuestSlug?: string;
};

const bindingStorageKey = "famous.land.july2026.boundGuest";
const deviceStorageKey = "famous.land.july2026.deviceId";

type BoundGuest = {
  slug: string;
  token?: string;
  boundAt: string;
};

type ServerBindingStatus =
  | "idle"
  | "local-only"
  | "server-bound"
  | "already-bound"
  | "claimed"
  | "token-mismatch"
  | "unavailable";

export function July2026App({ selectedGuestSlug }: July2026AppProps) {
  const [boundGuest, setBoundGuest] = useState<BoundGuest | null>(null);
  const [lh3VideoReady, setLh3VideoReady] = useState(false);
  const [serverBindingStatus, setServerBindingStatus] = useState<ServerBindingStatus>("idle");
  const selectedGuest = guestAssignments.find((guest) => guest.slug === selectedGuestSlug);
  const selectedGuestHouse =
    selectedGuest?.house && selectedGuest.house !== "Pending"
      ? houseProfiles.find((house) => house.name === selectedGuest.house)
      : null;
  const selectedItineraryHighlights = selectedGuest
    ? itineraryHighlights[selectedGuest.house]
    : [];
  const directionsHref =
    selectedGuestHouse && "mapsUrl" in selectedGuestHouse && selectedGuestHouse.mapsUrl
      ? selectedGuestHouse.mapsUrl
      : "https://www.google.com/maps/search/?api=1&query=Lake%20Monomonac%20Rindge%20NH%20Winchendon%20MA";
  const boundGuestProfile = useMemo(
    () => guestAssignments.find((guest) => guest.slug === boundGuest?.slug),
    [boundGuest]
  );
  const isViewingBoundGuest = Boolean(selectedGuest && boundGuest?.slug === selectedGuest.slug);
  const selectedGuestNeedsHostAssignment = selectedGuest?.house === "Pending";

  useEffect(() => {
    let cancelled = false;

    function getDeviceId() {
      const storedDeviceId = window.localStorage.getItem(deviceStorageKey);

      if (storedDeviceId) {
        return storedDeviceId;
      }

      const nextDeviceId = crypto.randomUUID();
      window.localStorage.setItem(deviceStorageKey, nextDeviceId);
      return nextDeviceId;
    }

    function storeLocalBinding(nextBinding: BoundGuest, status: ServerBindingStatus) {
      window.localStorage.setItem(bindingStorageKey, JSON.stringify(nextBinding));
      if (!cancelled) {
        setBoundGuest(nextBinding);
        setServerBindingStatus(status);
      }
    }

    try {
      const storedBinding = window.localStorage.getItem(bindingStorageKey);
      const parsedBinding = storedBinding ? (JSON.parse(storedBinding) as BoundGuest) : null;

      if (parsedBinding) {
        setBoundGuest(parsedBinding);
      }

      if (selectedGuest) {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get("t") ?? undefined;

        if (parsedBinding && parsedBinding.slug !== selectedGuest.slug) {
          setServerBindingStatus("local-only");
          return;
        }

        const nextBinding = {
          boundAt: new Date().toISOString(),
          slug: selectedGuest.slug,
          token
        };

        if (!token) {
          if (parsedBinding) {
            setServerBindingStatus("local-only");
            return;
          }

          storeLocalBinding(nextBinding, "local-only");
          return;
        }

        void fetch("/api/july2026/guest-bindings", {
          body: JSON.stringify({
            device_id: getDeviceId(),
            slug: selectedGuest.slug,
            token
          }),
          headers: {
            "content-type": "application/json"
          },
          method: "POST"
        })
          .then(async (response) => {
            const result = (await response.json().catch(() => null)) as
              | {
                  ok?: boolean;
                  mode?: ServerBindingStatus;
                  link?: { bound_at?: string; token?: string };
                }
              | null;

            if (cancelled) {
              return;
            }

            if (result?.ok) {
              storeLocalBinding(
                {
                  boundAt: result.link?.bound_at ?? nextBinding.boundAt,
                  slug: selectedGuest.slug,
                  token: result.link?.token ?? token
                },
                result.mode === "already-bound" ? "already-bound" : "server-bound"
              );
              return;
            }

            if (result?.mode === "claimed" || result?.mode === "token-mismatch") {
              setServerBindingStatus(result.mode);
              return;
            }

            storeLocalBinding(nextBinding, "local-only");
          })
          .catch(() => {
            if (!cancelled) {
              storeLocalBinding(nextBinding, "unavailable");
            }
          });
      }
    } catch {
      setBoundGuest(null);
      setServerBindingStatus("unavailable");
    }

    return () => {
      cancelled = true;
    };
  }, [selectedGuest]);

  function resetDeviceBinding() {
    window.localStorage.removeItem(bindingStorageKey);
    setBoundGuest(null);
    setServerBindingStatus("idle");
  }

  const bindingIsClaimed = serverBindingStatus === "claimed" || serverBindingStatus === "token-mismatch";

  return (
    <div className={`${styles.app} july-2026-app`}>
      <nav className={styles.topbar} aria-label="July 2026 event navigation">
        <div className={styles.navLinks}>
          <a href="#stay">My Stay</a>
          <a href="#resort-desk">Desk</a>
          <a href="#schedule">Schedule</a>
          <a href="#activities">Activities</a>
          <a href="#lake-rules">Rules</a>
          <a href="#food">Food</a>
          <a href="#guests">Guests</a>
          <a href="#map">Map</a>
          <a href="sms:+17819294932">Contact Host</a>
        </div>
      </nav>

      <section className={styles.hero} id="top">
        <Image
          src={heroImage}
          alt="Famous Land lake at dusk with chairs, a campfire, cabin lights, and fireworks."
          className={styles.heroImage}
          priority
          sizes="100vw"
        />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <h1>July 4th, 2026</h1>
            <p className={styles.date}>A Famous Land lake weekend</p>
            <p className={styles.sponsor}>Sponsored by famous.land</p>
            <p className={styles.lede}>
              {selectedGuest
                ? `Welcome, ${selectedGuest.name}. Your private lake-weekend check-in is ready with your room, house, schedule, and host text line.`
                : "A private resort-style guest portal for check-in, room assignments, lake-house directions, activities, meals, fireworks, and host help all weekend."}
            </p>
            <div className={styles.heroActions}>
              <a className={styles.secondaryButton} href="/july2026/arrival-card">
                Arrival Card
              </a>
              <a className={styles.secondaryButton} href="/july2026/directions">
                Directions Hub
              </a>
              <a className={styles.secondaryButton} href="#schedule">
                View Schedule
              </a>
              <a className={styles.secondaryButton} href="/july2026/calendar.ics">
                Add Calendar
              </a>
              <a className={styles.secondaryButton} href="/july2026/host-contact.vcf">
                Save Host
              </a>
              <a className={styles.secondaryButton} href="#guests">
                {selectedGuest ? "View My Stay" : "Guest Links"}
              </a>
              <a className={styles.secondaryButton} href="sms:+17819294932">
                Contact Host
              </a>
            </div>
          </div>

          <div className={styles.heroPanel} aria-label="Event details">
            <span>Check-in</span>
            <strong>Fri 3 PM</strong>
            <span>Fireworks</span>
            <strong>Sat 9 PM</strong>
            <span>Brunch</span>
            <strong>Sun 10 AM</strong>
          </div>
        </div>
      </section>

      <section className={styles.statusBar} aria-label="Day-of status">
        <strong>
          <span className={styles.liveDot} /> Resort desk
        </strong>
        {statusItems.map((item) => (
          <span className={styles.statusItem} key={item.label}>
            <span>{item.label}</span>
            <b>{item.value}</b>
          </span>
        ))}
        <a href="sms:+17819294932">Text 781-929-4932</a>
        <a href="/july2026/calendar.ics">Add Calendar</a>
        <a href="/july2026/host-contact.vcf">Save Host</a>
        <a href="/july2026/arrival-card">Arrival Card</a>
        <a href="/july2026/directions">Directions Hub</a>
        <a href="/july2026/weekend-guide.txt">Offline Guide</a>
      </section>

      <section className={styles.stayStrip} id="stay" aria-label="Personalized stay preview">
        <div>
          <span>Welcome</span>
          <strong>{selectedGuest ? `${selectedGuest.name}'s lake-weekend check-in` : "Your lake-weekend check-in"}</strong>
          <p>
            {selectedGuest
              ? "This personalized link opens directly to your weekend stay details."
              : "Personalized guest links open directly to each guest's house, room, and itinerary."}
          </p>
        </div>
        <div>
          <span>Room key</span>
          <strong>
            {selectedGuest
              ? selectedGuestNeedsHostAssignment
                ? "Host confirmation pending"
                : `${selectedGuest.house} / ${selectedGuest.room}`
              : "House and room assignment"}
          </strong>
          <p>
            {selectedGuest
              ? selectedGuest.note
              : "Guests can view their own stay first, with an option to browse the full guest list."}
          </p>
        </div>
        <div>
          <span>Help</span>
          <strong>Host text line</strong>
          <p>
            <a href="sms:+17819294932">Tap to message 781-929-4932</a>
          </p>
        </div>
      </section>

      <section className={styles.resortDesk} id="resort-desk" aria-label="Resort desk guide">
        <div className={styles.resortDeskHeader}>
          <span className={styles.sectionLabel}>Resort Desk</span>
          <h2>Fast answers for arrival weekend</h2>
          <p>
            The essentials guests will need most: room keys, host contact, live directions, and
            approval rules for lake and quad activities.
          </p>
        </div>
        <div className={styles.resortDeskGrid}>
          {resortDeskItems.map((item) => (
            <section key={item.label}>
              <span>{item.label}</span>
              <strong>{item.action}</strong>
              <p>{item.detail}</p>
            </section>
          ))}
        </div>
        <div className={styles.resortDeskActions}>
          <a href="#guests">Find My Room</a>
          <a href="/july2026/arrival-card">Arrival Card</a>
          <a href="#arrival">Arrival Checklist</a>
          <a href="/july2026/directions">Directions Hub</a>
          <a href="#map">House Directions</a>
          <a href="/july2026/calendar.ics">Add Calendar</a>
          <a href="/july2026/host-contact.vcf">Save Host Contact</a>
          <a href="/july2026/weekend-guide.txt">Offline Guide</a>
          <a href="sms:+17819294932">Text Host</a>
        </div>
      </section>

      <section className={styles.arrivalDesk} id="arrival" aria-label="Arrival checklist and text templates">
        <article>
          <div>
            <span className={styles.sectionLabel}>Arrival Desk</span>
            <h2>Land, settle, and know where to go</h2>
            <p>
              A practical mobile checklist for the first hour on site, plus ready-to-send host
              messages for the things most likely to come up.
            </p>
          </div>
          <ol className={styles.arrivalChecklist}>
            {arrivalChecklistItems.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
        </article>
        <article>
          <div>
            <span className={styles.sectionLabel}>Text Templates</span>
            <h2>Tap once, edit if needed</h2>
          </div>
          <div className={styles.textTemplateGrid}>
            {hostTextTemplates.map((template) => (
              <a
                href={`sms:+17819294932?body=${encodeURIComponent(template.body)}`}
                key={template.label}
              >
                <span>{template.label}</span>
                <p>{template.body}</p>
              </a>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.guestDesk} id="guests" aria-label="Guest stay details">
        <article className={styles.guestCard}>
          <div>
            <span className={styles.sectionLabel}>{selectedGuest ? "My Stay" : "Guest Check-In"}</span>
            <h2>{selectedGuest ? `${selectedGuest.name}'s stay` : "Choose a guest link"}</h2>
            <p>
              {selectedGuest
                ? "A concise room-key view for arrival, room assignment, house context, and host help."
                : "Each guest has a direct link for their own room-key view. Assignments shown as pending still need host confirmation."}
            </p>
          </div>

          {selectedGuest ? (
            <>
              <div className={isViewingBoundGuest && !bindingIsClaimed ? styles.bindingNotice : styles.bindingWarning}>
                <div>
                  <strong>
                    {bindingIsClaimed
                      ? "Room-key needs host reset"
                      : isViewingBoundGuest
                        ? "Device check-in active"
                        : "Viewing without rebinding"}
                  </strong>
                  <p>
                    {bindingIsClaimed
                      ? "This link is already bound or no longer matches the current room-key token. Text the host for a fresh link."
                      : isViewingBoundGuest
                      ? `This device is checked in as ${selectedGuest.name}.`
                      : boundGuestProfile
                        ? `This device is already checked in as ${boundGuestProfile.name}; opening ${selectedGuest.name}'s link did not overwrite it.`
                        : "This browser could not store a device check-in, but the room-key details are still available."}
                  </p>
                </div>
                {boundGuest ? (
                  <button type="button" onClick={resetDeviceBinding}>
                    Reset device
                  </button>
                ) : null}
              </div>
              {selectedGuestNeedsHostAssignment ? (
                <div className={styles.pendingAssignmentNotice}>
                  <div>
                    <strong>Room assignment coming from the host</strong>
                    <p>
                      You are on the guest list, but your lake house and room are still being finalized.
                      Text the host for the latest assignment before arrival.
                    </p>
                  </div>
                  <a href="sms:+17819294932">Text Host</a>
                </div>
              ) : null}
              <dl className={styles.stayDetails}>
                <div>
                  <dt>House</dt>
                  <dd>{selectedGuestNeedsHostAssignment ? "Pending host confirmation" : selectedGuest.house}</dd>
                </div>
                <div>
                  <dt>Room</dt>
                  <dd>{selectedGuestNeedsHostAssignment ? "Pending host confirmation" : selectedGuest.room}</dd>
                </div>
                <div>
                  <dt>Arrival</dt>
                  <dd>{selectedGuest.arrival}</dd>
                </div>
                <div>
                  <dt>Departure</dt>
                  <dd>{selectedGuest.departure}</dd>
                </div>
                <div>
                  <dt>House note</dt>
                  <dd>
                    {selectedGuestNeedsHostAssignment
                      ? "Text the host for current lodging details."
                      : selectedGuestHouse?.role ?? selectedGuest.note}
                  </dd>
                </div>
                <div>
                  <dt>Staying with</dt>
                  <dd>{selectedGuest.companions.length ? selectedGuest.companions.join(", ") : "Solo room assignment"}</dd>
                </div>
              </dl>
              <div className={styles.roomKeyActions}>
                <a href={`/july2026/guest/${selectedGuest.slug}/packet.txt`}>
                  Download My Room Key
                </a>
                <a href={`/july2026/guest/${selectedGuest.slug}/calendar.ics`}>Add My Calendar</a>
                <a href={directionsHref} target="_blank" rel="noreferrer">
                  {selectedGuestHouse && "mapsUrl" in selectedGuestHouse && selectedGuestHouse.mapsUrl
                    ? `Directions to ${selectedGuestHouse.name}`
                    : "Open Lake Area Map"}
                </a>
                <a href={`/july2026/guest/${selectedGuest.slug}/qr.svg`}>Show My QR</a>
                <a href="/july2026/weekend-guide.txt">Download Weekend Guide</a>
              </div>
              <div className={styles.personalItinerary}>
                <div className={styles.personalItineraryHeader}>
                  <span className={styles.sectionLabel}>My Itinerary</span>
                  <strong>House-specific highlights</strong>
                </div>
                <ol>
                  {selectedItineraryHighlights.map((item) => (
                    <li key={`${item.time}-${item.title}`}>
                      <time>{item.time}</time>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <div className={styles.guestLinkIntro}>
              <strong>Private room-key links</strong>
              <p>Use these for guest testing now; the admin page can generate fresh token-style versions.</p>
            </div>
          )}
        </article>

        <article className={styles.guestDirectory}>
          <div className={styles.directoryHeader}>
            <span className={styles.sectionLabel}>Guest Directory</span>
            <strong>{guestAssignments.length} guests</strong>
          </div>
          <div className={styles.guestLinks}>
            {guestAssignments.map((guest) => (
              <a
                className={guest.slug === selectedGuest?.slug ? styles.activeGuestLink : undefined}
                href={`/july2026/guest/${guest.slug}`}
                key={guest.slug}
              >
                <span>{guest.name}</span>
                <small>
                  {guest.house === "Pending" ? "Pending" : `${guest.house} / ${guest.room}`}
                </small>
              </a>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.contentGrid} aria-label="Event planning">
        <article className={styles.panel} id="schedule">
          <div className={styles.panelHeader}>
            <Icon path="M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm11 8H6v10h12V10Z" />
            <h2>Schedule</h2>
          </div>
          <ol className={styles.scheduleList}>
            {scheduleItems.map((item) => (
              <li key={item.time}>
                <time>{item.time}</time>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className={styles.panel} id="map">
          <div className={styles.panelHeader}>
            <Icon path="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
            <h2>Location</h2>
          </div>
          <p className={styles.address}>
            Famous Land
            <br />
            Lake Monomonac weekend houses
            <br />
            Rindge, NH and Winchendon, MA
          </p>
          <div className={styles.mapCard} role="img" aria-label="Illustrated event map by the lake">
            <span className={styles.eventPin}>Event area</span>
            <span className={styles.parkingPin}>Parking</span>
            <span className={styles.lakeLabel}>Lake Monomonac</span>
          </div>
          <div className={styles.transitGuide} aria-label="House-to-house guide">
            <span className={styles.sectionLabel}>Getting Around</span>
            <div>
              {transitGuideItems.map((item) => (
                <section key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </section>
              ))}
            </div>
          </div>
          <div className={styles.resortDirectory} aria-label="Lake house directory">
            {houseProfiles.map((house) => (
              <section key={house.name}>
                <div>
                  <strong>{house.name}</strong>
                  <p>{house.role}</p>
                </div>
                <small>{house.note}</small>
                {"mapsUrl" in house && house.mapsUrl ? (
                  <a href={house.mapsUrl} target="_blank" rel="noreferrer">
                    Directions
                  </a>
                ) : (
                  <span>Directions pending</span>
                )}
              </section>
            ))}
          </div>
          <a className={styles.mapButton} href={directionsHref} target="_blank" rel="noreferrer">
            {selectedGuestHouse && "mapsUrl" in selectedGuestHouse && selectedGuestHouse.mapsUrl
              ? `Directions to ${selectedGuestHouse.name}`
              : "Open Lake Area Map"}
          </a>
        </article>

        <div className={styles.sideStack}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <Icon path="M4 10.5 12 4l8 6.5V21h-6v-6h-4v6H4V10.5Z" />
              <h2>Houses</h2>
            </div>
            <div className={styles.houseList}>
              {houseProfiles.map((house) => {
                const houseImage =
                  house.image && house.image in houseImages
                    ? houseImages[house.image as keyof typeof houseImages]
                    : null;

                return (
                  <section className={houseImage ? styles.featuredHouse : undefined} key={house.name}>
                    {houseImage && "videoSrc" in houseImage ? (
                      <div className={styles.houseVideoFrame}>
                        <Image
                          src={houseImage.src}
                          alt={houseImage.alt}
                          className={styles.houseVideoPoster}
                          sizes="(max-width: 1080px) 100vw, 360px"
                        />
                        <video
                          aria-label={houseImage.alt}
                          autoPlay
                          className={`${styles.houseImage} ${styles.houseVideo} ${
                            lh3VideoReady ? styles.houseVideoReady : ""
                          }`}
                          loop
                          muted
                          onCanPlay={() => setLh3VideoReady(true)}
                          playsInline
                          poster={houseImage.src.src}
                          preload="metadata"
                        >
                          <source src={houseImage.videoSrc} type="video/mp4" />
                        </video>
                      </div>
                    ) : houseImage ? (
                      <Image
                        src={houseImage.src}
                        alt={houseImage.alt}
                        className={styles.houseImage}
                        sizes="(max-width: 1080px) 100vw, 360px"
                      />
                    ) : null}
                    {houseImage && "gallery" in houseImage ? (
                      <div className={styles.houseGallery} aria-label={`${house.name} photos`}>
                        {houseImage.gallery.map((image) => (
                          <span className={styles.houseGalleryFrame} key={image.alt}>
                            <Image
                              src={image.src}
                              alt={image.alt}
                              className={styles.houseGalleryImage}
                              fill
                              sizes="(max-width: 1080px) 33vw, 110px"
                            />
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <strong>{houseImage ? houseImage.label : house.name}</strong>
                    <p>{house.role}</p>
                    <ul aria-label={`${house.name} rooms`}>
                      {house.rooms.map((room) => (
                        <li key={room}>{room}</li>
                      ))}
                    </ul>
                    <small>{house.note}</small>
                    {"mapsUrl" in house && house.mapsUrl ? (
                      <a className={styles.houseMapLink} href={house.mapsUrl} target="_blank" rel="noreferrer">
                        {house.mapLabel}
                      </a>
                    ) : (
                      <span className={styles.houseMapPending}>{house.mapLabel}</span>
                    )}
                  </section>
                );
              })}
            </div>
          </article>

          <article className={styles.panel} id="fleet">
            <div className={styles.panelHeader}>
              <Icon path="M4 15h16l-2.1-5.4A3 3 0 0 0 15.1 7H8.9a3 3 0 0 0-2.8 2.6L4 15Zm3-6h10l1.2 4H5.8L7 9Zm-.5 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm11 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
              <h2>Motorized Fleet</h2>
            </div>
            <div className={styles.vehicleList}>
              {motorizedVehicles.map((vehicle) => {
                const vehicleImage = vehicleImages[vehicle.image as keyof typeof vehicleImages];

                return (
                  <section className={styles.vehicleRow} key={vehicle.name}>
                    <Image
                      src={vehicleImage.src}
                      alt={vehicleImage.alt}
                      className={styles.vehicleImage}
                      sizes="(max-width: 1080px) 96px, 96px"
                    />
                    <div className={styles.vehicleBody}>
                      <strong>{vehicle.name}</strong>
                      <p>{vehicle.type}</p>
                      <dl className={styles.vehicleMeta}>
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
                      </dl>
                      <div className={styles.vehicleGuide} aria-label={`${vehicle.name} operating notes`}>
                        <span>{vehicle.bestFor}</span>
                        <span>{vehicle.pickup}</span>
                        <span>{vehicle.approval}</span>
                      </div>
                      <p>{vehicle.detail}</p>
                    </div>
                  </section>
                );
              })}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <Icon path="m9.5 16.2-4-4 1.4-1.4 2.6 2.6 7.6-7.6 1.4 1.4-9 9Z" />
              <h2>What to Bring</h2>
            </div>
            <ul className={styles.bringList}>
              {bringItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.resortGuide} aria-label="Activities and food guide">
        <article className={styles.panel} id="activities">
          <div className={styles.panelHeader}>
            <Icon path="M4 18.5c2.5 0 2.5-1.5 5-1.5s2.5 1.5 5 1.5 2.5-1.5 5-1.5v2c-2.5 0-2.5 1.5-5 1.5s-2.5-1.5-5-1.5-2.5 1.5-5 1.5v-2Zm2-5.5 3.2-6.8 3.1 5.4 1.8-2.8L20 16H4l2-3Zm3.4-2.7L7.8 14h3.9L9.4 10.3Z" />
            <h2>Activities</h2>
          </div>
          <div className={styles.activityGrid}>
            {activityItems.map((activity) => (
              <section key={activity.title}>
                <span>{activity.location}</span>
                <strong>{activity.title}</strong>
                <p>{activity.detail}</p>
              </section>
            ))}
          </div>
        </article>

        <article className={styles.panel} id="lake-rules">
          <div className={styles.panelHeader}>
            <Icon path="M12 2 4 5.5v6.1c0 4.8 3.3 8.8 8 10.4 4.7-1.6 8-5.6 8-10.4V5.5L12 2Zm0 2.2 6 2.6v4.8c0 3.7-2.4 6.8-6 8.1-3.6-1.3-6-4.4-6-8.1V6.8l6-2.6Zm-1 10.4 5-5-1.4-1.4-3.6 3.6-1.6-1.6L8 11.6l3 3Z" />
            <h2>Lake Rules</h2>
          </div>
          <div className={styles.approvalList}>
            {lakeUseRules.map((rule) => (
              <section key={rule.label}>
                <strong>{rule.label}</strong>
                <p>{rule.detail}</p>
              </section>
            ))}
          </div>
        </article>

        <article className={styles.panel} id="food">
          <div className={styles.panelHeader}>
            <Icon path="M7 2h2v8a3 3 0 0 1-2 2.83V22H5v-9.17A3 3 0 0 1 3 10V2h2v8h2V2Zm8 0h2v20h-2v-8h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1Z" />
            <h2>Food and Drinks</h2>
          </div>
          <ol className={styles.foodList}>
            {foodMoments.map((moment) => (
              <li key={`${moment.time}-${moment.title}`}>
                <time>{moment.time}</time>
                <div>
                  <strong>{moment.title}</strong>
                  <p>{moment.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className={styles.hostHelp} id="host-help" aria-label="Host help and approvals">
        <article className={styles.panel}>
          <div className={styles.hostHelpIntro}>
            <div>
              <span className={styles.sectionLabel}>Host Help</span>
              <h2>Questions, notes, and approvals</h2>
              <p>
                Text the host for dietary notes, motorized lake use, quad requests, cruise plans,
                or room-key help.
              </p>
            </div>
            <a className={styles.mapButton} href="sms:+17819294932">
              Text Host
            </a>
          </div>
          <div className={styles.hostHelpGrid}>
            {hostHelpItems.map((item) => (
              <section key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.photoStrip} aria-label="Event highlights">
        <div>
          <span>Sunset dock</span>
        </div>
        <div>
          <span>House check-in</span>
        </div>
        <div>
          <span>Campfire</span>
        </div>
        <div>
          <span>Fireworks</span>
        </div>
      </section>
    </div>
  );
}
