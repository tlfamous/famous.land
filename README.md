# Famous Land Quest

Mobile-first Next.js game site for `famous.land`.

Twenty active tree markers across Famous Land each have a unique QR code. A scan opens that marker URL, records the find in the browser, syncs it to the server fallback store, and unlocks progress through the four zone quests inside the overall Famous Land Quest.

## What Is Built

- Next.js App Router with TypeScript
- Root marker routes from the CSV, for example `/8K4P2`
- Compatibility marker routes at `/t/FF-TREE-001`
- Local anonymous player identity with `crypto.randomUUID()`
- Browser progress tracking in `localStorage`
- Idempotent scans, so re-scanning one marker does not double count
- Server API routes:
  - `POST /api/scan`
  - `GET /api/progress?player_id=`
  - `POST /api/save-progress`
  - `POST /api/recover`
  - `POST /api/recover/[code]`
- Cloudflare D1 persistence in production with local JSON fallback at `.data/famous-land-db.json`
- Optional Brevo email save/recovery flow with one-tap recovery links
- Home, marker, quest, safety, save-progress, recover, and admin recovery pages

## Marker CSV

Source CSV:

```text
assets/famous_land_tree_marker_qr_codes_30.csv
```

Columns used:

- `marker_id`
- `short_code`
- `qr_url`
- `notes`

The CSV URLs are root paths such as `https://famous.land/8K4P2`, so the app creates root dynamic marker pages like `/8K4P2`.

## Local Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Try a marker URL from the CSV:

```text
http://localhost:3000/8K4P2
```

## Game Rules

- Lakeview Zone: `Lakeview Quest`
- No Wake Zone: `No Wake Quest`
- Treetop Zone: `Treetop Quest`
- Hillside Zone: `Hillside Quest`
- Famous Land Quest: complete every zone quest
- Any 5 markers: save-progress prompt

## Privacy And Safety

The app does not collect GPS location. It does not require name, phone, email, or exact location. Email is optional and used only to recover progress.

Safety language is included on marker pages and `/safety`:

- Play only with permission.
- Stay on safe paths and known routes.
- Do not climb trees, rocks, fences, or unstable structures.
- Do not swim, boat, or go onto the island unless supervised and conditions are safe.
- Children should be supervised near the lake.
- Watch for ticks, poison ivy, storms, slippery ground, and uneven terrain.
- Do not play after dark.
- If weather changes, stop and return to a safe place.

## Persistence

The database abstraction lives in:

```text
lib/db.ts
```

In production on Cloudflare, the app uses the D1 binding named `DB`.

By default, local development writes to:

```text
.data/famous-land-db.json
```

You can override that path with:

```bash
FAMOUS_LAND_DB_PATH=/absolute/path/famous-land-db.json
```

The Cloudflare schema lives in:

```text
migrations/0001_famous_land_quest.sql
```

Apply migrations remotely:

```bash
npx wrangler d1 migrations apply famous-land-quest --remote
```

To move later to Supabase, Neon, Postgres, Vercel storage, or another durable store, keep the public route contracts the same and replace the implementation behind `lib/db.ts`.

## Email Provider

The save/recover flow sends transactional email through Brevo when configured.
Emails use the branded Famous Land mobile-first HTML template and include a
one-tap recovery link like `/recover/RECOVERY-CODE`; opening that link on the
quest phone restores progress into that phone's browser storage. If Brevo is
not configured, the app falls back to showing the local recovery link so
development still works.

Brevo has a free plan that currently includes transactional email and 300 email
sends per day. That is enough for this game flow unless the quest gets heavy
same-day traffic.

Local `.env.local` example:

```bash
EMAIL_PROVIDER=brevo
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=quest@famous.land
EMAIL_FROM_NAME="Famous Land Quest"
NEXT_PUBLIC_SITE_URL=https://famous.land
```

For Cloudflare, keep the API key as a secret:

```bash
npx wrangler secret put BREVO_API_KEY
```

Set the non-secret values in the Cloudflare dashboard or local environment:

```bash
EMAIL_PROVIDER=brevo
EMAIL_FROM=quest@famous.land
EMAIL_FROM_NAME="Famous Land Quest"
NEXT_PUBLIC_SITE_URL=https://famous.land
```

Recommended production flow:

1. Save the player email only after opt-in.
2. Generate a recovery link backed by a private recovery token.
3. Send the link by email.
4. Never show email in leaderboards or public UI.
5. Do not add passwords.

Optional environment variables:

```bash
EMAIL_REPLY_TO=help@famous.land
EMAIL_REPLY_TO_NAME="Famous Land"
```

## Deploy To Cloudflare

GitHub Pages cannot run Next.js API routes. This app is configured for Cloudflare Workers with OpenNext and D1.

One-time setup:

```bash
npx wrangler d1 create famous-land-quest
```

Put the returned `database_id` in `wrangler.jsonc`, then run:

```bash
npx wrangler d1 migrations apply famous-land-quest --remote
npm run cf:deploy
```

`wrangler.jsonc` currently routes `famous.land/*` and `www.famous.land/*` to the Worker. This Cloudflare account does not have a `workers.dev` subdomain registered, so the public hostnames are the deployment targets.

## Deploy To Vercel

Cloudflare is the primary deployment target. If you move the app to Vercel later:

1. Import the repo in Vercel.
2. Framework preset: Next.js.
3. Build command: `npm run build`.
4. Output directory: leave default.
5. Add a real database before relying on cross-device persistence.
6. Add an email provider before relying on magic-link recovery.

## Existing GitHub Pages Note

The current domain was previously pointed at GitHub Pages. That static host can serve the old single-image page, but it cannot run `/api/scan`, `/api/progress`, `/api/save-progress`, or `/api/recover`. Switch the domain to a Next-compatible host when this game should go live.
