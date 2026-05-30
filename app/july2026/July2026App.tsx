"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import heroImage from "./assets/july-4-hero.png";
import lakeHouse1Image from "./assets/lake-house-1.jpeg";
import lakeHouse3Image from "./assets/lake-house-3.jpeg";
import { bringItems, houseProfiles, scheduleItems, statusItems } from "./data";
import styles from "./july2026.module.css";

type RsvpState = {
  name: string;
  response: "yes" | "maybe" | "no";
  guests: number;
  note: string;
};

const initialRsvp: RsvpState = {
  name: "",
  response: "yes",
  guests: 2,
  note: ""
};

function Icon({ path }: { path: string }) {
  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  );
}

const houseImages = {
  "lake-house-1": {
    alt: "Aerial view of Lake House 1 on a wooded peninsula.",
    label: "LH1",
    src: lakeHouse1Image
  },
  "lake-house-3": {
    alt: "Exterior of Lake House 3 with stone siding, green roof, and patio.",
    label: "LH3",
    src: lakeHouse3Image
  }
} as const;

export function July2026App() {
  const [rsvp, setRsvp] = useState(initialRsvp);
  const [submitted, setSubmitted] = useState(false);

  const rsvpSummary = useMemo(() => {
    const partyLabel = rsvp.guests === 1 ? "1 guest" : `${rsvp.guests} guests`;
    if (rsvp.response === "no") {
      return "Thanks for letting us know. We'll miss you at the lake.";
    }
    if (rsvp.response === "maybe") {
      return `Saved as maybe for ${partyLabel}. We will check in before June 25.`;
    }
    return `You're on the list for ${partyLabel}. See you July 4th, 2026.`;
  }, [rsvp.guests, rsvp.response]);

  function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className={`${styles.app} july-2026-app`}>
      <nav className={styles.topbar} aria-label="July 2026 event navigation">
        <div className={styles.navLinks}>
          <a href="#stay">My Stay</a>
          <a href="#schedule">Schedule</a>
          <a href="#map">Map</a>
          <a href="sms:+17819294932">Contact Host</a>
          <a href="#rsvp">RSVP</a>
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
                  house.image === "lake-house-1" || house.image === "lake-house-3"
                    ? houseImages[house.image]
                    : null;

                return (
                  <section className={houseImage ? styles.featuredHouse : undefined} key={house.name}>
                    {houseImage ? (
                      <Image
                        src={houseImage.src}
                        alt={houseImage.alt}
                        className={styles.houseImage}
                        sizes="(max-width: 1080px) 100vw, 360px"
                      />
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

          <article className={styles.panel} id="rsvp">
            <div className={styles.panelHeader}>
              <Icon path="M16 11a4 4 0 1 0-3.8-5.3A4 4 0 0 0 8 12a6 6 0 0 0-6 6v2h12v-2a7.9 7.9 0 0 0-.5-2.8A5 5 0 0 1 22 18v2h-6v-2a6 6 0 0 0-2.3-4.7A4 4 0 0 0 16 11Z" />
              <h2>RSVP</h2>
            </div>
            <p className={styles.rsvpCopy}>Help us plan food and activities. Please reply by June 25, 2026.</p>
            <form className={styles.rsvpForm} onSubmit={submitRsvp}>
              <label>
                Name
                <input
                  required
                  value={rsvp.name}
                  onChange={(event) => setRsvp({ ...rsvp, name: event.target.value })}
                  placeholder="Your name"
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  Reply
                  <select
                    value={rsvp.response}
                    onChange={(event) =>
                      setRsvp({ ...rsvp, response: event.target.value as RsvpState["response"] })
                    }
                  >
                    <option value="yes">I'll be there</option>
                    <option value="maybe">Maybe</option>
                    <option value="no">Can't make it</option>
                  </select>
                </label>
                <label>
                  Party
                  <input
                    min="1"
                    max="12"
                    type="number"
                    value={rsvp.guests}
                    onChange={(event) => setRsvp({ ...rsvp, guests: Number(event.target.value) })}
                  />
                </label>
              </div>
              <label>
                Notes
                <textarea
                  value={rsvp.note}
                  onChange={(event) => setRsvp({ ...rsvp, note: event.target.value })}
                  placeholder="Dietary needs, arrival timing, or questions"
                />
              </label>
              <button type="submit">Submit RSVP</button>
            </form>
            {submitted ? (
              <p className={styles.confirmation} role="status">
                {rsvpSummary}
              </p>
            ) : null}
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
