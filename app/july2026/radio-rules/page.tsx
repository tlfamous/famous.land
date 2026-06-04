import Image from "next/image";
import type { Metadata } from "next";
import radioImage from "../assets/radio-motorola-t605-h2o.png";
import { hostSmsHref, radioHandleRows, radioRules } from "../data";
import styles from "./radio-rules.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Radio Rules",
  description: "Walkie-talkie channel rules and guest radio handles for the July 4th, 2026 lake weekend.",
  robots: {
    index: false,
    follow: false
  }
};

export default function July2026RadioRulesPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>Lake rules</p>
            <h1>Radio Rules</h1>
            <p>Radios provided at the houses on Lake Monomonac.</p>
          </div>

          <figure className={styles.radioCard}>
            <Image
              className={styles.radioImage}
              src={radioImage}
              alt="Orange Motorola walkie-talkie radio for Lake Monomonac house communication."
              priority
            />
            <figcaption>Walkie-talkies to be provided.</figcaption>
          </figure>
        </header>

        <section className={styles.rulesPanel}>
          <div>
            <p className={styles.kicker}>Radio Rules</p>
            <h2>How to Call</h2>
          </div>
          <ul>
            {radioRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>

        <section className={styles.handlePanel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>Radio handles</p>
              <h2>Guest Handles</h2>
            </div>
            <p>Handles for guests listed below.</p>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Handle</th>
                </tr>
              </thead>
              <tbody>
                {radioHandleRows.map((guest) => (
                  <tr key={guest.slug}>
                    <td>{guest.name}</td>
                    <td>{guest.handle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href={hostSmsHref}>Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
