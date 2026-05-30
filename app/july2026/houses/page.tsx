import type { StaticImageData } from "next/image";
import type { Metadata } from "next";
import lakeHouse1Image from "../assets/lake-house-1.jpeg";
import lakeHouse2ExteriorFrontImage from "../assets/lake-house-2-exterior-front.jpeg";
import lakeHouse2ExteriorSideImage from "../assets/lake-house-2-exterior-side.jpeg";
import lakeHouse2KitchenImage from "../assets/lake-house-2-kitchen.jpeg";
import lakeHouse2LivingRoomImage from "../assets/lake-house-2-living-room.jpeg";
import lakeHouse3Image from "../assets/lake-house-3.jpeg";
import { guestAssignments, hostSmsHref, houseProfiles, itineraryHighlights, transitGuideItems } from "../data";
import styles from "./houses.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 House Directory | famous.land",
  description: "LH1, LH2, and LH3 house directory for the famous.land July 4th, 2026 lake weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const lakeAreaUrl =
  "https://www.google.com/maps/search/?api=1&query=Lake%20Monomonac%20Rindge%20NH%20Winchendon%20MA";

const houseMedia: Record<
  string,
  {
    alt: string;
    gallery?: { alt: string; src: StaticImageData }[];
    src: StaticImageData;
  }
> = {
  "lake-house-1": {
    alt: "Aerial view of LH1 on a wooded peninsula.",
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
    src: lakeHouse2ExteriorFrontImage
  },
  "lake-house-3": {
    alt: "Exterior of LH3 with stone siding, green roof, and patio.",
    src: lakeHouse3Image
  }
};

export default function July2026HousesPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land house directory</p>
            <h1>LH1, LH2, and LH3</h1>
            <p>
              A resort-style house guide for where guests are staying, where the weekend gathers,
              and which directions are ready before arrival.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="House directory quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/map">Resort Map</a>
            <a href="/july2026/directions">Directions Hub</a>
            <a href="/july2026/arrival-card">Arrival Card</a>
            <a href="/july2026/itinerary">Itinerary</a>
            <a href="/july2026/meals">Meals Guide</a>
            <a href={hostSmsHref}>Text Host</a>
          </nav>
        </header>

        <section className={styles.summaryGrid} aria-label="House summary">
          {houseProfiles.map((house) => {
            const mapsUrl = "mapsUrl" in house ? house.mapsUrl : undefined;

            return (
              <article key={house.name}>
                <span>{mapsUrl ? "Directions ready" : "Address pending"}</span>
                <strong>{house.name}</strong>
                <p>{house.role}</p>
              </article>
            );
          })}
        </section>

        <section className={styles.houseStack} aria-label="Lake house profiles">
          {houseProfiles.map((house) => {
            const assignedGuests = guestAssignments.filter((guest) => guest.house === house.name);
            const mapsUrl = "mapsUrl" in house ? house.mapsUrl : undefined;
            const media = house.image ? houseMedia[house.image] : undefined;
            const highlights = itineraryHighlights[house.name as keyof typeof itineraryHighlights];

            return (
              <article className={styles.houseCard} key={house.name}>
                {media ? (
                  <div className={styles.mediaColumn}>
                    <img
                      src={media.src.src}
                      alt={media.alt}
                      className={styles.houseImage}
                      loading="eager"
                    />
                    {media.gallery ? (
                      <div className={styles.gallery} aria-label={`${house.name} photos`}>
                        {media.gallery.map((image) => (
                          <span key={image.alt}>
                            <img
                              src={image.src.src}
                              alt={image.alt}
                              className={styles.galleryImage}
                              loading="eager"
                            />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className={styles.houseBody}>
                  <div className={styles.houseHeader}>
                    <div>
                      <span>{mapsUrl ? "Directions ready" : "Address pending"}</span>
                      <h2>{house.name}</h2>
                    </div>
                    <strong>{house.role}</strong>
                  </div>

                  <p className={styles.address}>{house.note}</p>

                  <div className={styles.infoGrid}>
                    <section>
                      <strong>Rooms and spaces</strong>
                      <div className={styles.chipList}>
                        {house.rooms.map((room) => (
                          <span key={room}>{room}</span>
                        ))}
                      </div>
                    </section>
                    <section>
                      <strong>Assigned guests</strong>
                      <div className={styles.chipList}>
                        {assignedGuests.length ? (
                          assignedGuests.map((guest) => <span key={guest.slug}>{guest.name}</span>)
                        ) : (
                          <span>Pending host confirmation</span>
                        )}
                      </div>
                    </section>
                  </div>

                  <ol className={styles.highlightList}>
                    {highlights.map((item) => (
                      <li key={`${house.name}-${item.time}-${item.title}`}>
                        <time>{item.time}</time>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className={styles.cardActions}>
                    <a href={mapsUrl ?? lakeAreaUrl} target="_blank" rel="noreferrer">
                      {mapsUrl ? house.mapLabel : "Open Lake Area Map"}
                    </a>
                    <a href="/july2026/directions">Directions Hub</a>
                    <a href={hostSmsHref}>Text Host</a>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className={styles.flowPanel} aria-labelledby="house-flow-title">
          <div>
            <p className={styles.kicker}>Weekend movement</p>
            <h2 id="house-flow-title">House-to-house flow</h2>
          </div>
          <ol>
            {transitGuideItems.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </li>
            ))}
          </ol>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href={hostSmsHref}>Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
