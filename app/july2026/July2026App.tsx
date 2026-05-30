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
  bringItems,
  guestAssignments,
  houseProfiles,
  motorizedVehicles,
  scheduleItems,
  statusItems
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

type BoundGuest = {
  slug: string;
  token?: string;
  boundAt: string;
};

export function July2026App({ selectedGuestSlug }: July2026AppProps) {
  const [boundGuest, setBoundGuest] = useState<BoundGuest | null>(null);
  const selectedGuest = guestAssignments.find((guest) => guest.slug === selectedGuestSlug);
  const selectedGuestHouse =
    selectedGuest?.house && selectedGuest.house !== "Pending"
      ? houseProfiles.find((house) => house.name === selectedGuest.house)
      : null;
  const boundGuestProfile = useMemo(
    () => guestAssignments.find((guest) => guest.slug === boundGuest?.slug),
    [boundGuest]
  );
  const isViewingBoundGuest = Boolean(selectedGuest && boundGuest?.slug === selectedGuest.slug);

  useEffect(() => {
    try {
      const storedBinding = window.localStorage.getItem(bindingStorageKey);

      if (storedBinding) {
        setBoundGuest(JSON.parse(storedBinding) as BoundGuest);
        return;
      }

      if (selectedGuest) {
        const searchParams = new URLSearchParams(window.location.search);
        const nextBinding = {
          boundAt: new Date().toISOString(),
          slug: selectedGuest.slug,
          token: searchParams.get("t") ?? undefined
        };

        window.localStorage.setItem(bindingStorageKey, JSON.stringify(nextBinding));
        setBoundGuest(nextBinding);
      }
    } catch {
      setBoundGuest(null);
    }
  }, [selectedGuest]);

  function resetDeviceBinding() {
    window.localStorage.removeItem(bindingStorageKey);
    setBoundGuest(null);
  }

  return (
    <div className={`${styles.app} july-2026-app`}>
      <nav className={styles.topbar} aria-label="July 2026 event navigation">
        <div className={styles.navLinks}>
          <a href="#stay">My Stay</a>
          <a href="#schedule">Schedule</a>
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
              <a className={styles.secondaryButton} href="#schedule">
                View Schedule
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
            {selectedGuest ? `${selectedGuest.house} / ${selectedGuest.room}` : "House and room assignment"}
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
              <div className={isViewingBoundGuest ? styles.bindingNotice : styles.bindingWarning}>
                <div>
                  <strong>{isViewingBoundGuest ? "Device check-in active" : "Viewing without rebinding"}</strong>
                  <p>
                    {isViewingBoundGuest
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
              <dl className={styles.stayDetails}>
                <div>
                  <dt>House</dt>
                  <dd>{selectedGuest.house}</dd>
                </div>
                <div>
                  <dt>Room</dt>
                  <dd>{selectedGuest.room}</dd>
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
                  <dd>{selectedGuestHouse?.role ?? selectedGuest.note}</dd>
                </div>
                <div>
                  <dt>Staying with</dt>
                  <dd>{selectedGuest.companions.length ? selectedGuest.companions.join(", ") : "Solo room assignment"}</dd>
                </div>
              </dl>
            </>
          ) : (
            <div className={styles.guestLinkIntro}>
              <strong>Private room-key links</strong>
              <p>Use these for guest testing now; they can become tokenized links when binding is added.</p>
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
          <a className={styles.mapButton} href="https://maps.google.com" target="_blank" rel="noreferrer">
            Get Directions
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
                      <video
                        aria-label={houseImage.alt}
                        autoPlay
                        className={styles.houseImage}
                        loop
                        muted
                        playsInline
                        poster={houseImage.src.src}
                      >
                        <source src={houseImage.videoSrc} type="video/mp4" />
                      </video>
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
                  </section>
                );
              })}
            </div>
          </article>

          <article className={styles.panel}>
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
                          <dt>Color</dt>
                          <dd>{vehicle.color}</dd>
                        </div>
                        <div>
                          <dt>Capacity</dt>
                          <dd>{vehicle.capacity}</dd>
                        </div>
                      </dl>
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
