"use client";

import Image from "next/image";
import heroImage from "./assets/july-4-hero.png";
import lakeHouse1Image from "./assets/lake-house-1.jpeg";
import lakeHouse2ExteriorFrontImage from "./assets/lake-house-2-exterior-front.jpeg";
import lakeHouse2ExteriorSideImage from "./assets/lake-house-2-exterior-side.jpeg";
import lakeHouse2KitchenImage from "./assets/lake-house-2-kitchen.jpeg";
import lakeHouse2LivingRoomImage from "./assets/lake-house-2-living-room.jpeg";
import lakeHouse3Image from "./assets/lake-house-3.jpeg";
import { bringItems, houseProfiles, scheduleItems, statusItems } from "./data";
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

export function July2026App() {
  return (
    <div className={`${styles.app} july-2026-app`}>
      <nav className={styles.topbar} aria-label="July 2026 event navigation">
        <div className={styles.navLinks}>
          <a href="#stay">My Stay</a>
          <a href="#schedule">Schedule</a>
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
              A private resort-style guest portal for check-in, room assignments, lake-house
              directions, activities, meals, fireworks, and host help all weekend.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.secondaryButton} href="#schedule">
                View Schedule
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
          <strong>Your lake-weekend check-in</strong>
          <p>Personalized guest links will open directly to each guest's house, room, and itinerary.</p>
        </div>
        <div>
          <span>Room key</span>
          <strong>House and room assignment</strong>
          <p>Guests can view their own stay first, with an option to browse the full guest list.</p>
        </div>
        <div>
          <span>Help</span>
          <strong>Host text line</strong>
          <p>
            <a href="sms:+17819294932">Tap to message 781-929-4932</a>
          </p>
        </div>
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
