import Image from "next/image";
import type { Metadata } from "next";
import canAmQuadImage from "../../assets/vehicle-can-am-quad.png";
import laconicVehicleImage from "../../assets/vehicle-laconic-switch.png";
import laikaVehicleImage from "../../assets/vehicle-laika-trixx.png";
import spikeyLizardVehicleImage from "../../assets/vehicle-spikey-lizard-gtx.png";
import { hostTextTemplates, lakeUseRules, motorizedVehicles } from "../../data";
import styles from "./fleet-signs.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Fleet Signs | famous.land",
  description: "Print-friendly July 2026 dock and motorized fleet signs for host-approved lake use.",
  robots: {
    index: false,
    follow: false
  }
};

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
  },
  "can-am-quad": {
    alt: "Gray Can-Am quad reference for the two-seat quad.",
    src: canAmQuadImage
  }
} as const;

const approvalText =
  hostTextTemplates.find((template) => template.label === "Fleet approval")?.body ??
  "Hi, I would like host approval or timing guidance for motorized lake fleet use.";

export default function July2026FleetSignsPage() {
  return (
    <main className={styles.sheet}>
      <header className={styles.header}>
        <div>
          <p>famous.land lake operations</p>
          <h1>Motorized Fleet Signs</h1>
          <span>Print for the dock, fleet table, and host briefing area.</span>
        </div>
        <nav aria-label="Admin links">
          <a href="/july2026/admin">Admin</a>
          <a href="/july2026/fleet">Fleet Guide</a>
          <a href="/july2026/admin/briefing-sheet">Briefing</a>
        </nav>
      </header>

      <section className={styles.signs} aria-label="Printable fleet signs">
        <article className={styles.rulesSign}>
          <div className={styles.rulesHeader}>
            <div>
              <span>Before any motorized use</span>
              <h2>Host Approval Required</h2>
              <p>
                Motorized lake fleet use starts only after the Saturday LH1 briefing and
                a host go-ahead. Text the host before changing cruise plans or taking out a vehicle.
              </p>
            </div>
            <img src="/july2026/qr.svg" alt="July 4th, 2026 guest portal QR code" />
          </div>

          <dl className={styles.contactGrid}>
            <div>
              <dt>Host text line</dt>
              <dd>781-929-4932</dd>
            </div>
            <div>
              <dt>Text prompt</dt>
              <dd>{approvalText}</dd>
            </div>
            <div>
              <dt>Fleet guide</dt>
              <dd>famous.land/july2026/fleet</dd>
            </div>
          </dl>

          <section className={styles.ruleGrid}>
            {lakeUseRules.map((rule) => (
              <article key={rule.label}>
                <strong>{rule.label}</strong>
                <p>{rule.detail}</p>
              </article>
            ))}
          </section>
        </article>

        {motorizedVehicles.map((vehicle) => {
          const vehicleImage = vehicleImages[vehicle.image as keyof typeof vehicleImages];

          return (
            <article className={styles.vehicleSign} key={vehicle.name}>
              <div className={styles.vehicleHeader}>
                <div>
                  <span>{vehicle.color} / {vehicle.capacity}</span>
                  <h2>{vehicle.name}</h2>
                  <p>{vehicle.type}</p>
                </div>
                <Image
                  src={vehicleImage.src}
                  alt={vehicleImage.alt}
                  className={styles.vehicleImage}
                  sizes="(max-width: 760px) 100vw, 360px"
                  priority
                />
              </div>

              <dl className={styles.vehicleDetails}>
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
                  <dt>Capacity</dt>
                  <dd>{vehicle.capacity}</dd>
                </div>
              </dl>

              <footer>
                <strong>Text host before use</strong>
                <span>781-929-4932</span>
              </footer>
            </article>
          );
        })}
      </section>
    </main>
  );
}
