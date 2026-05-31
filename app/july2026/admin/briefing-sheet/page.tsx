import type { Metadata } from "next";
import {
  activityItems,
  arrivalChecklistItems,
  bringItems,
  foodMoments,
  hostTextTemplates,
  lakeUseRules,
  motorizedVehicles,
  scheduleItems,
  transitGuideItems
} from "../../data";
import styles from "./briefing-sheet.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Host Briefing Sheet | famous.land",
  description: "Print-friendly July 2026 host briefing sheet for schedule, arrivals, food, and lake rules.",
  robots: {
    index: false,
    follow: false
  }
};

export default function July2026BriefingSheetPage() {
  return (
    <main className={styles.sheet}>
      <header className={styles.header}>
        <div>
          <p>famous.land guest operations</p>
          <h1>July 4th, 2026 Host Briefing</h1>
          <span>One-page operating guide for check-in, meals, lake flow, and host approvals.</span>
        </div>
        <nav aria-label="Admin links">
          <a href="/july2026/admin">Admin</a>
          <a href="/july2026/admin/sms-packets">SMS packets</a>
          <a href="/july2026/admin/host-texts">Host texts</a>
          <a href="/july2026/admin/media-shot-list">Media shot list</a>
          <a href="/july2026/admin/room-keys">Room keys</a>
        </nav>
      </header>

      <section className={styles.heroGrid} aria-label="Weekend essentials">
        <article>
          <strong>Host text line</strong>
          <span>781-929-4932</span>
        </article>
        <article>
          <strong>Guest portal</strong>
          <span>https://famous.land/july2026</span>
        </article>
        <article>
          <strong>Weekend</strong>
          <span>Friday, July 3 through Sunday, July 5, 2026</span>
        </article>
        <article>
          <strong>Launch caveats</strong>
          <span>Checkout time and remaining room photos are pending.</span>
        </article>
      </section>

      <section className={styles.twoColumn}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Operations</span>
            <h2>Arrival Checklist</h2>
          </div>
          <ol className={styles.checkList}>
            {arrivalChecklistItems.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Movement</span>
            <h2>House Flow</h2>
          </div>
          <div className={styles.cardList}>
            {transitGuideItems.map((item) => (
              <section key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.schedulePanel}>
        <div className={styles.panelHeader}>
          <span>Run of Show</span>
          <h2>Weekend Schedule</h2>
        </div>
        <ol className={styles.schedule}>
          {scheduleItems.map((item) => (
            <li key={`${item.time}-${item.title}`}>
              <time>{item.time}</time>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.threeColumn}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Food</span>
            <h2>Meals</h2>
          </div>
          <ol className={styles.compactList}>
            {foodMoments.map((moment) => (
              <li key={`${moment.time}-${moment.title}`}>
                <time>{moment.time}</time>
                <strong>{moment.title}</strong>
                <p>{moment.detail}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Lake</span>
            <h2>Approvals</h2>
          </div>
          <div className={styles.cardList}>
            {lakeUseRules.map((rule) => (
              <section key={rule.label}>
                <strong>{rule.label}</strong>
                <p>{rule.detail}</p>
              </section>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Packing</span>
            <h2>What to Bring</h2>
          </div>
          <ul className={styles.bringList}>
            {bringItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className={styles.twoColumn}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Activities</span>
            <h2>Guest Options</h2>
          </div>
          <div className={styles.cardList}>
            {activityItems.map((activity) => (
              <section key={activity.title}>
                <strong>{activity.title}</strong>
                <p>
                  {activity.location}. {activity.detail}
                </p>
              </section>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Fleet</span>
            <h2>Motorized Vehicles</h2>
          </div>
          <div className={styles.cardList}>
            {motorizedVehicles.map((vehicle) => (
              <section key={vehicle.name}>
                <strong>{vehicle.name}</strong>
                <p>
                  {vehicle.type}. {vehicle.capacity}. {vehicle.approval}.
                </p>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.textTemplates} aria-label="Host text templates">
        <div className={styles.panelHeader}>
          <span>Messages</span>
          <h2>Common Host Text Prompts</h2>
        </div>
        <div>
          {hostTextTemplates.map((template) => (
            <section key={template.label}>
              <strong>{template.label}</strong>
              <p>{template.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
