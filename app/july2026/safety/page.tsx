import type { Metadata } from "next";
import { hostSmsHref, hostTextTemplates, lakeUseRules, scheduleItems } from "../data";
import styles from "./safety.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Safety and Approvals | famous.land",
  description: "Guest safety, lake rules, host approvals, and emergency-first guidance for the famous.land July 4th, 2026 weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const orientation = scheduleItems.find((item) => item.title === "Motorized lake vehicle orientation");
const boatRide = scheduleItems.find((item) => item.title === "Boat ride");
const approvalTemplate =
  hostTextTemplates.find((template) => template.label === "Fleet approval")?.body ??
  "Hi, I would like host approval or timing guidance for motorized lake fleet use.";

const priorityItems = [
  {
    label: "Emergency first",
    action: "Call 911",
    detail: "For urgent medical, fire, water, or safety emergencies, call 911 first, then text the host when safe."
  },
  {
    label: "Host line",
    action: "781-929-4932",
    detail: "Use the host line for directions, room help, dietary notes, link resets, fleet approval, and non-emergency safety questions."
  },
  {
    label: "Orientation",
    action: orientation?.time ?? "Sat 11 AM",
    detail: orientation?.detail ?? "Motorized lake vehicle use starts only after the host safety briefing and go-ahead."
  }
];

const safetyChecklist = [
  "Use life jackets for boating, PWC rides, and lake activities when the host asks.",
  "Wait for the Saturday LH1 orientation before using motorized lake equipment.",
  "Follow the host-designated dock plan for the LH1-to-LH3 boat ride and any return trips.",
  "Text before changing cruise plans, taking out a motorized vehicle, or requesting quad/four-wheeler time.",
  "Keep guest room-key links, the host contact card, and the offline guide available on your phone.",
  "For urgent emergencies, call 911 first."
];

export default function July2026SafetyPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land safety desk</p>
            <h1>Safety and Approvals</h1>
            <p>
              The quick guest guide for emergencies, host contact, lake rules, life jackets,
              dock movement, motorized fleet approval, and Saturday orientation.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Safety quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/day-of">Day-Of Desk</a>
            <a href="/july2026/faq">Guest FAQ</a>
            <a href="/july2026/rain-plan">Rain Plan</a>
            <a href="/july2026/map">Resort Map</a>
            <a href="/july2026/concierge">Guest Concierge</a>
            <a href="/july2026/fleet">Fleet Guide</a>
            <a href="/july2026/arrival-card">Arrival Card</a>
            <a href={`sms:+17819294932?&body=${encodeURIComponent(approvalTemplate)}`}>Text Host</a>
          </nav>
        </header>

        <section className={styles.priorityGrid} aria-label="Safety priorities">
          {priorityItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.action}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className={styles.twoColumn}>
          <article className={styles.panel}>
            <p className={styles.kicker}>Before action</p>
            <h2>Lake Rules</h2>
            <div className={styles.ruleList}>
              {lakeUseRules.map((rule) => (
                <section key={rule.label}>
                  <strong>{rule.label}</strong>
                  <p>{rule.detail}</p>
                </section>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <p className={styles.kicker}>Guest checklist</p>
            <h2>Do These First</h2>
            <ol className={styles.checkList}>
              {safetyChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        </section>

        <section className={styles.timelinePanel}>
          <div>
            <p className={styles.kicker}>Saturday lake flow</p>
            <h2>Orientation, ride, return</h2>
          </div>
          <div className={styles.timeline}>
            <article>
              <time>{orientation?.time ?? "Sat 11 AM"}</time>
              <strong>{orientation?.title ?? "Motorized lake vehicle orientation"}</strong>
              <p>{orientation?.detail ?? "Host safety briefing before motorized lake fleet use."}</p>
            </article>
            <article>
              <time>{boatRide?.time ?? "Sat 11:30 AM"}</time>
              <strong>{boatRide?.title ?? "Boat ride"}</strong>
              <p>{boatRide?.detail ?? "Depart LH1 and return to LH3 for lunch."}</p>
            </article>
          </div>
        </section>

        <section className={styles.textPanel}>
          <p className={styles.kicker}>Tap to send</p>
          <h2>Host Text Prompts</h2>
          <div className={styles.promptGrid}>
            {hostTextTemplates.map((template) => (
              <a key={template.label} href={`sms:+17819294932?&body=${encodeURIComponent(template.body)}`}>
                <strong>{template.label}</strong>
                <span>{template.body}</span>
              </a>
            ))}
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
