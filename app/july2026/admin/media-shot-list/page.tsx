import Image from "next/image";
import type { Metadata } from "next";
import heroImage from "../../assets/july-4-hero.png";
import lh1Image from "../../assets/lake-house-1.jpeg";
import lh2ExteriorFrontImage from "../../assets/lake-house-2-exterior-front.jpeg";
import lh2ExteriorSideImage from "../../assets/lake-house-2-exterior-side.jpeg";
import lh2KitchenImage from "../../assets/lake-house-2-kitchen.jpeg";
import lh2LivingRoomImage from "../../assets/lake-house-2-living-room.jpeg";
import lh3Image from "../../assets/lake-house-3.jpeg";
import laconicVehicleImage from "../../assets/vehicle-laconic-switch.png";
import laikaVehicleImage from "../../assets/vehicle-laika-trixx.png";
import spikeyLizardVehicleImage from "../../assets/vehicle-spikey-lizard-gtx.png";
import styles from "./media-shot-list.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Media Shot List | famous.land",
  description: "Print-friendly July 2026 media checklist for remaining guest portal photos.",
  robots: {
    index: false,
    follow: false
  }
};

const bundledMedia = [
  {
    alt: "Generated July 4th lake weekend hero artwork.",
    label: "Hero artwork",
    note: "Guest portal, admin hero, itinerary/fleet visual system",
    src: heroImage
  },
  {
    alt: "Aerial view of LH1 on a wooded peninsula.",
    label: "LH1 exterior",
    note: "LH1 house profile",
    src: lh1Image
  },
  {
    alt: "LH2 exterior front with Camp Peace sign.",
    label: "LH2 exterior front",
    note: "LH2 house profile",
    src: lh2ExteriorFrontImage
  },
  {
    alt: "LH2 side exterior above the lake.",
    label: "LH2 exterior side",
    note: "LH2 gallery",
    src: lh2ExteriorSideImage
  },
  {
    alt: "LH2 kitchen with canoe mounted overhead.",
    label: "LH2 kitchen",
    note: "LH2 gallery",
    src: lh2KitchenImage
  },
  {
    alt: "LH2 living room with stone fireplace.",
    label: "LH2 living room",
    note: "LH2 gallery",
    src: lh2LivingRoomImage
  },
  {
    alt: "Exterior of LH3 with stone siding and patio.",
    label: "LH3 exterior",
    note: "LH3 poster and video fallback",
    src: lh3Image
  },
  {
    alt: "Red Sea-Doo Switch pontoon boat reference.",
    label: "Laconic reference",
    note: "Fleet guide and admin inventory",
    src: laconicVehicleImage
  },
  {
    alt: "Blue Sea-Doo GTX PWC reference.",
    label: "Spikey Lizard reference",
    note: "Fleet guide and admin inventory",
    src: spikeyLizardVehicleImage
  },
  {
    alt: "Red Sea-Doo Spark Trixx reference.",
    label: "Laika reference",
    note: "Fleet guide and admin inventory",
    src: laikaVehicleImage
  }
] as const;

const shotGroups = [
  {
    house: "LH1",
    status: "Address and interiors pending",
    shots: [
      {
        framing: "Bright horizontal room photo with seating, windows, and food-service surface visible.",
        priority: "High",
        title: "Sunroom",
        use: "Friday 6:30 PM welcome meal and LH1 profile confidence."
      },
      {
        framing: "Wide room view that shows where guests gather for briefing.",
        priority: "High",
        title: "Great Room 1",
        use: "Friday 7:00 PM weekend orientation location."
      },
      {
        framing: "Outdoor lake-facing view with the peninsula shape and gathering area clear.",
        priority: "High",
        title: "Grand Peninsula",
        use: "Friday campfire and Saturday fireworks viewing option."
      },
      {
        framing: "Fire pit plus seating/lake context, ideally late afternoon or golden hour.",
        priority: "High",
        title: "South Grand Peninsula fire pit",
        use: "Saturday s'mores, sparklers, snacks, and evening fire plan."
      },
      {
        framing: "One clean horizontal image per sleeping area, with bed/sofa layout readable.",
        priority: "Medium",
        title: "Bedrooms",
        use: "Guest assignment confidence for Heather/Eric, The Girls' Room group, and Jack."
      }
    ]
  },
  {
    house: "LH2",
    status: "Bedroom photos pending",
    shots: [
      {
        framing: "Horizontal room photo showing beds, windows, and guest storage if available.",
        priority: "High",
        title: "South bedroom",
        use: "Guest assignment confidence for Cin and Vin."
      },
      {
        framing: "Horizontal room photo showing the sleep setup and path into the room.",
        priority: "High",
        title: "North bedroom",
        use: "Guest assignment confidence for Adam and Gage."
      }
    ]
  },
  {
    house: "LH3",
    status: "Beach, room, and meal-detail photos pending",
    shots: [
      {
        framing: "Wide lake-facing view with beach/lake access visible.",
        priority: "High",
        title: "Beach",
        use: "Saturday yoga, swimming, non-motorized lake activities, and fireworks option."
      },
      {
        framing: "Clean horizontal room image showing bed and key room character.",
        priority: "High",
        title: "Primary bedroom",
        use: "Guest assignment confidence for Holly and Tod."
      },
      {
        framing: "Wide gathering image with table/seating flow clear.",
        priority: "Medium",
        title: "Dining and gathering area",
        use: "Saturday lunch, dinner, and Sunday brunch context."
      },
      {
        framing: "Detail shots of serving surfaces, lakeside patio seating, and meal staging.",
        priority: "Medium",
        title: "Smoothie, lunch, dinner, and brunch areas",
        use: "Food-moment polish across itinerary, prep, and guest portal."
      }
    ]
  }
] as const;

const captureTips = [
  "Prefer horizontal photos for house cards and guest pages.",
  "Shoot one clean wide photo first, then one detail photo if the space has character.",
  "Avoid tight crops; leave room around the subject for responsive web cropping.",
  "Bright daylight works best for rooms, beach, decks, and lake access.",
  "Send original-size images when possible so the site can crop and optimize them cleanly."
] as const;

export default function July2026MediaShotListPage() {
  return (
    <main className={`${styles.sheet} july-2026-app`}>
      <header className={styles.header}>
        <div>
          <p>famous.land guest media</p>
          <h1>July 2026 Media Shot List</h1>
          <span>Photo capture checklist for replacing remaining pending media with polished guest-facing imagery.</span>
        </div>
        <nav aria-label="Admin links">
          <a href="/july2026/admin">Admin</a>
          <a href="/july2026/admin/missing-content.txt">Missing packet</a>
          <a href="/july2026">Guest portal</a>
        </nav>
      </header>

      <section className={styles.heroGrid} aria-label="Media summary">
        <article>
          <strong>Bundled now</strong>
          <span>{bundledMedia.length} assets</span>
        </article>
        <article>
          <strong>Still needed</strong>
          <span>LH1, LH2 rooms, LH3 beach/details</span>
        </article>
        <article>
          <strong>Best format</strong>
          <span>Horizontal, bright, original size</span>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span>Current assets</span>
          <h2>Already Bundled</h2>
        </div>
        <div className={styles.mediaGrid}>
          {bundledMedia.map((item) => (
            <article key={item.label}>
              <Image src={item.src} alt={item.alt} sizes="(max-width: 900px) 50vw, 190px" />
              <div>
                <strong>{item.label}</strong>
                <p>{item.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.shotStack} aria-label="Needed media shot list">
        {shotGroups.map((group) => (
          <article className={styles.panel} key={group.house}>
            <div className={styles.panelHeader}>
              <span>{group.status}</span>
              <h2>{group.house}</h2>
            </div>
            <div className={styles.shotGrid}>
              {group.shots.map((shot) => (
                <section key={shot.title}>
                  <span>{shot.priority}</span>
                  <strong>{shot.title}</strong>
                  <p>{shot.use}</p>
                  <small>{shot.framing}</small>
                </section>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span>Capture notes</span>
          <h2>Photo Tips</h2>
        </div>
        <ul className={styles.tipList}>
          {captureTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
