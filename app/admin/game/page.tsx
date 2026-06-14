import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getZoneMarkers, TOTAL_MARKERS } from "@/lib/game";

export const metadata: Metadata = {
  title: "Game | Famous Land Admin",
  description: "High-level Famous Land game overview, mechanics, admin tools, and production reference."
};

const gameOverview = [
  {
    label: "Core loop",
    detail:
      "Players walk the land, find physical QR markers, scan them with a phone, and build progress across zone quests."
  },
  {
    label: "Player identity",
    detail:
      "No login is required. The app uses an anonymous phone ID for progress, scan history, reports, and recovery."
  },
  {
    label: "Progression",
    detail:
      "Markers roll up into zone quests, completion state, and one hidden-until-complete grand-prize reveal."
  },
  {
    label: "Admin workflow",
    detail:
      "The admin area tracks scans and players, tests every QR route, maintains land maps, and captures future feature work."
  }
];

const colorTokens = [
  {
    name: "Ink",
    token: "--ink",
    value: "#11140f",
    use: "Primary text, dark hero gradients, and primary buttons."
  },
  {
    name: "Paper",
    token: "--paper",
    value: "#f7f3e8",
    use: "Page background and warm outdoor base tone."
  },
  {
    name: "Paper strong",
    token: "--paper-strong",
    value: "#fffaf0",
    use: "Light text on dark panels and high-contrast card surfaces."
  },
  {
    name: "Field",
    token: "--field",
    value: "#d8e3bd",
    use: "Secondary buttons, notices, and soft completion states."
  },
  {
    name: "Moss",
    token: "--moss",
    value: "#536b35",
    use: "Progress fills, nature accents, and earned-state borders."
  },
  {
    name: "Moss dark",
    token: "--moss-dark",
    value: "#26361c",
    use: "Zone quest cards, map pills, marker counters, and dark nature gradients."
  },
  {
    name: "Bark",
    token: "--bark",
    value: "#6d543c",
    use: "Legal/safety accents and earthy secondary contrast."
  },
  {
    name: "Water",
    token: "--water",
    value: "#2f6f77",
    use: "Lake/map accents, save callouts, and progress gradients."
  }
];

const designElements = [
  "Mobile-first layout with a 980px default content width and wider workspaces for maps and testing.",
  "Sticky dark header with cow mark, compact brand lockup, public pill navigation, and admin branding.",
  "Full-screen image homepage using FamousLand2.png as the first impression.",
  "Dark photographic hero cards for admin, marker, safety, maps, and progress entry points.",
  "Warm paper cards with 8px radius, thin ink-tinted borders, and soft outdoor shadows.",
  "Oversized compact headlines, uppercase eyebrow labels, and system sans typography.",
  "Pill buttons for primary, secondary, and sticky actions.",
  "Progress bars that move from moss to water, reused across marker, progress, and quest views.",
  "Zone quest, marker, report, table, and map summary list patterns.",
  "Responsive admin left navigation, map workspace, data tables, and iPhone-style scan tester."
];

const publicFeatures = [
  "Single-image public landing page at /.",
  "Physical QR marker routes at root short codes such as /8K4P2.",
  "Compatibility marker routes at /t/FF-TREE-001.",
  "Marker scan pages with compact welcome state, Marker Map preview, current-zone quest progress, field note, outdoor challenge, and clue.",
  "First-scan onboarding state that introduces the quest before the normal marker flow.",
  "Anonymous browser player ID and local progress tracking with no login required.",
  "Lakeview Quest, No Wake Quest, Treetop Quest, and Hillside Quest progress.",
  `Hidden grand-prize reveal after all ${TOTAL_MARKERS} markers are found in any order.`,
  "Famous Land Quest dashboard at /quest with marker progress, zone quests, found marker list, save, and recovery help.",
  "Save-progress prompt after 5 markers, with optional email recovery.",
  "Brevo-powered one-tap recovery email for restoring saved marker progress on a new or cleared phone.",
  "Safety page with private-property recreational-use notice and prohibited-use rules.",
  "Contact page with SMS support button and optional PayPal donation link."
];

const adminFeatures = [
  "Admin dashboard with left navigation, compact filters, KPI cards, scan-volume timeline, and latest scan log.",
  "Dashboard filters for date range, timeline unit, zone, player, and whether test scans are included.",
  "Scan log with Eastern timestamps, email ID, phone ID, location, zone, and Scan Type showing Test or Real.",
  "Player database with phone IDs, scan count, last scan, saved email, and phone contact fields.",
  "Messages admin tool with recovery candidates table and Brevo recovery-link sender.",
  "Feature Backlog page for active planning items and future game/admin work.",
  "iPhone QR test lab for walking every marker route without printing or rescanning physical tags, plus printed-tag QR preview.",
  "Land map workspace with survey-corrected parcel layers, zone highlights, acreage summary, and document viewer.",
  "Full-screen map document pages for survey and ANR reference images.",
  "One-tap recovery links that restore progress when opened from the quest phone.",
  "Redirect from /admin/reports back to the consolidated admin dashboard."
];

const dataAndIntegrations = [
  "Next.js API routes for scan logging, progress lookup, save-progress, recovery, player reports, and admin reports.",
  "Cloudflare D1 persistence through the DB binding in production.",
  "Local JSON fallback at .data/famous-land-db.json for development.",
  "LocalStorage for anonymous device progress, scan history, and saved-progress state.",
  "Brevo transactional email for branded mobile-first save-progress receipts and one-tap recovery links.",
  "Cloudflare environment variables configure EMAIL_PROVIDER, EMAIL_FROM, EMAIL_REPLY_TO, and NEXT_PUBLIC_SITE_URL.",
  "Scan events record test-vs-real source so admin reports can include or exclude tester activity.",
  "Active marker source data curated from the original tree-marker export.",
  "Map and survey imagery in public/assets/maps.",
  "No GPS collection, no required name, no required email, and no public leaderboard."
];

const operations = [
  {
    label: "Github repo",
    href: "https://github.com/tlfamous/famous.land.git"
  },
  {
    label: "App package",
    value: "famous-land-quest",
    detail: "Next.js App Router with TypeScript, React 19, and Next 16."
  },
  {
    label: "Primary hosting",
    value: "Cloudflare Workers",
    detail: "Built with @opennextjs/cloudflare and deployed with Wrangler/OpenNext under the tlfmaous@gmail.com Cloudflare account."
  },
  {
    label: "Cloudflare account",
    value: "tlfmaous@gmail.com",
    detail: "Use this Cloudflare account for Workers, D1, DNS, routes, and Brevo domain-authentication records."
  },
  {
    label: "Production domains",
    value: "famous.land and www.famous.land",
    detail: "wrangler.jsonc routes both hostnames to the Worker."
  },
  {
    label: "Database and reporting",
    value: "Cloudflare D1",
    detail: "Production DB binding stores scans, scan events, saved players, contacts, recovery requests, and reports."
  },
  {
    label: "Email service",
    value: "Brevo",
    detail: "Transactional save-progress and recovery emails are sent through Brevo using Cloudflare secrets."
  },
  {
    label: "Deploy command",
    value: "npm run cf:deploy",
    detail: "Builds Next, packages OpenNext for Cloudflare, then deploys the Worker."
  }
];

const routes = [
  { path: "/", purpose: "Image-first public landing page." },
  { path: "/[code]", purpose: "Root QR marker page by short code." },
  { path: "/t/[markerId]", purpose: "Compatibility marker page by full marker ID." },
  { path: "/quest", purpose: "Famous Land Quest dashboard with marker progress, zone quests, save, and recover links." },
  { path: "/quests", purpose: "Compatibility redirect to /quest." },
  { path: "/progress", purpose: "Redirects old progress links to /quest." },
  { path: "/prize/lakemonomonac2026", purpose: "Hidden grand-prize page reached from the completion reveal." },
  { path: "/save-progress", purpose: "Optional email save flow." },
  { path: "/recover", purpose: "Public recovery-help page for players who need admin support." },
  { path: "/recover/[code]", purpose: "One-tap recovery link that restores progress on the quest phone." },
  { path: "/safety", purpose: "Safety and recreational-use notice." },
  { path: "/contact", purpose: "SMS support entry with optional donation link." },
  { path: "/admin", purpose: "Admin dashboard with scan reports, filters, KPI cards, timeline, and scan log." },
  { path: "/admin/backlog", purpose: "Feature Backlog and planning list." },
  { path: "/admin/game", purpose: "This game, site, feature, and operations inventory." },
  { path: "/admin/design", purpose: "Redirects to /admin/game." },
  { path: "/admin/players", purpose: "Player/contact database report." },
  { path: "/admin/messages", purpose: "Admin Brevo recovery-email sender and future text-message communication tools." },
  { path: "/admin/recovery", purpose: "Redirects to /admin/messages." },
  { path: "/test", purpose: "Admin iPhone route tester." },
  { path: "/maps", purpose: "Land parcel and survey workspace." },
  { path: "/maps/documents/[documentSlug]", purpose: "Full-screen survey image viewer." }
];

const hillsideTagCount = getZoneMarkers("Hillside").length;

const gameStructure = [
  {
    label: "Markers",
    value: String(TOTAL_MARKERS),
    detail: `Physical tree markers with unique QR short codes; Hillside has ${hillsideTagCount} tags.`
  },
  {
    label: "Zone quests",
    value: "4",
    detail: "Lakeview Quest, No Wake Quest, Treetop Quest, and Hillside Quest."
  },
  { label: "Save unlock", value: "5", detail: "Email save prompt appears after five marker finds." }
];

export default function GameReferencePage() {
  return (
    <div className="stack design-reference-page">
      <section className="hero-card design-reference-hero">
        <h1>Famous Land Game</h1>
        <p>
          Famous Land is a private-property outdoor QR quest: players walk the land,
          find physical markers, scan them with a phone, and build progress without
          requiring account creation.
        </p>
      </section>

      <section className="card game-summary-card">
        <div className="report-section-head">
          <p className="eyebrow">Game overview</p>
          <h2>How the quest works</h2>
        </div>
        <p className="game-summary-lede">
          The game is intentionally lightweight for visitors and operationally visible
          for admin work. Players get a simple field experience; the admin tools provide
          testing, scan reporting, player lookup, land planning, and feature tracking.
        </p>
        <div className="game-summary-grid">
          {gameOverview.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="report-stat-grid" aria-label="Game structure">
        {gameStructure.map((item) => (
          <article className="report-stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </section>

      <section className="card">
        <div className="report-section-head">
          <p className="eyebrow">Operations</p>
          <h2>Repo, hosting, and deployment</h2>
        </div>
        <div className="design-operation-list">
          {operations.map((item) => (
            <article key={item.label}>
              {"href" in item ? (
                <a className="design-operation-link" href={item.href} rel="noreferrer" target="_blank">
                  {item.label}
                </a>
              ) : (
                <>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.detail}</small>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="report-section-head">
          <p className="eyebrow">Design system</p>
          <h2>Visual language</h2>
        </div>
        <div className="design-token-grid">
          {colorTokens.map((color) => (
            <article key={color.token}>
              <span
                aria-hidden="true"
                className="design-color-swatch"
                style={{ backgroundColor: color.value } as CSSProperties}
              />
              <div>
                <strong>{color.name}</strong>
                <code>
                  {color.token} {color.value}
                </code>
                <small>{color.use}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid two">
        <article className="card design-list-card">
          <p className="eyebrow">Interface</p>
          <h2>Design elements</h2>
          <ul className="design-check-list">
            {designElements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card design-list-card">
          <p className="eyebrow">Public site</p>
          <h2>Player features</h2>
          <ul className="design-check-list">
            {publicFeatures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid two">
        <article className="card design-list-card">
          <p className="eyebrow">Admin</p>
          <h2>Tools and reports</h2>
          <ul className="design-check-list">
            {adminFeatures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card design-list-card">
          <p className="eyebrow">Service</p>
          <h2>Data and integrations</h2>
          <ul className="design-check-list">
            {dataAndIntegrations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card">
        <div className="report-section-head">
          <p className="eyebrow">Routes</p>
          <h2>Site map</h2>
        </div>
        <div className="report-table-wrap">
          <table className="report-table design-route-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.path}>
                  <td>
                    <code>{route.path}</code>
                  </td>
                  <td>{route.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
