import Image from "next/image";
import type { Metadata } from "next";
import laconicVehicleImage from "../assets/vehicle-laconic-switch.png";
import laikaVehicleImage from "../assets/vehicle-laika-trixx.png";
import spikeyLizardVehicleImage from "../assets/vehicle-spikey-lizard-gtx.png";
import { hostTextTemplates, lakeUseRules, motorizedVehicles, scheduleItems } from "../data";
import styles from "./fleet.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Motorized Fleet | famous.land",
  description: "Guest-facing motorized lake fleet inventory and approval guide for the famous.land July 4th, 2026 weekend.",
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
  }
} as const;

const orientation = scheduleItems.find((item) => item.title === "Motorized lake vehicle orientation");
const boatRide = scheduleItems.find((item) => item.title === "Boat ride");
const approvalTemplate =
  hostTextTemplates.find((template) => template.label === "Fleet approval")?.body ??
  "Hi, I would like host approval or timing guidance for motorized lake fleet use.";

export default function July2026FleetPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land lake fleet</p>
            <h1>Motorized Fleet</h1>
            <p>
              The named lake vehicles for July 4th weekend, with capacity, best-use,
              start-point, and host-approval notes in one guest-friendly guide.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Fleet quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/map">Resort Map</a>
            <a href="/july2026/itinerary">Weekend Itinerary</a>
            <a href="/july2026/concierge">Guest Concierge</a>
            <a href="/july2026/safety">Safety Guide</a>
            <a href={`sms:+17819294932?&body=${encodeURIComponent(approvalTemplate)}`}>Text For Approval</a>
          </nav>
        </header>

        <section className={styles.summaryGrid} aria-label="Fleet operating summary">
          <article>
            <span>Orientation</span>
            <strong>{orientation?.time ?? "Sat 11 AM"}</strong>
            <p>{orientation?.detail ?? "Safety briefing and host approval flow before motorized lake fleet use."}</p>
          </article>
          <article>
            <span>Group ride</span>
            <strong>{boatRide?.time ?? "Sat 11:30 AM"}</strong>
            <p>{boatRide?.detail ?? "Departure from LH1 and return to LH3."}</p>
          </article>
          <article>
            <span>Host line</span>
            <strong>781-929-4932</strong>
            <p>Text before taking out a motorized vehicle, changing cruise plans, or requesting timing guidance.</p>
          </article>
        </section>

        <section className={styles.vehicleStack} aria-label="Motorized vehicle inventory">
          {motorizedVehicles.map((vehicle) => {
            const vehicleImage = vehicleImages[vehicle.image as keyof typeof vehicleImages];

            return (
              <article className={styles.vehicleCard} key={vehicle.name}>
                <div className={styles.vehicleImageFrame}>
                  <Image
                    src={vehicleImage.src}
                    alt={vehicleImage.alt}
                    className={styles.vehicleImage}
                    sizes="(max-width: 860px) 100vw, 420px"
                    priority={vehicle.name === "Laconic"}
                  />
                </div>
                <div className={styles.vehicleBody}>
                  <div>
                    <p className={styles.kicker}>{vehicle.color} / {vehicle.capacity}</p>
                    <h2>{vehicle.name}</h2>
                    <p>{vehicle.type}</p>
                  </div>
                  <dl className={styles.vehicleMeta}>
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
                  </dl>
                  <p className={styles.detail}>{vehicle.detail}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className={styles.panel}>
          <p className={styles.kicker}>Before use</p>
          <h2>Lake Approval Rules</h2>
          <div className={styles.ruleGrid}>
            {lakeUseRules.map((rule) => (
              <article key={rule.label}>
                <strong>{rule.label}</strong>
                <p>{rule.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href={`sms:+17819294932?&body=${encodeURIComponent(approvalTemplate)}`}>Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
