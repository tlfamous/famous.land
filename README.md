# Famous Land Summer Quest

Mobile-first Next.js game site for `famous.land`.

Thirty physical tree markers across Famous Land each have a unique QR code. A scan opens that marker URL, records the find in the browser, syncs it to the server fallback store, and unlocks progress toward quests and badges.

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
- Local JSON database fallback at `.data/famous-land-db.json`
- Optional email save/recovery flow stub with recovery-code fallback
- Home, marker, progress, quests, safety, save-progress, and recover pages

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

- First marker: `First Find`
- Any 3 markers: `Calf Scout`
- Any 5 markers: `Five Marker Find` and save-progress prompt
- Road Walker zone: `Road Walker`
- Hill Top zone: `Hill Top Explorer`
- Tree Top zone: `Tree Top Tracker`
- On the Water zone: `Water Scout`
- Island marker: `Island Cow`
- Any 20 markers: `Summer Explorer`
- All 30 markers: `Famous Land Finisher`

The island marker is `FF-TREE-030` / `A66DJ`.

## Privacy And Safety

The app does not collect GPS location. It does not require name, phone, email, or exact location. Email is optional and used only to recover progress.

Safety language is included on marker pages and `/safety`:

- Play only with permission.
- Stay on safe paths and known areas.
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

By default, local development writes to:

```text
.data/famous-land-db.json
```

You can override that path with:

```bash
FAMOUS_LAND_DB_PATH=/absolute/path/famous-land-db.json
```

On Vercel without a real database, the fallback writes to `/tmp/famous-land-db.json`, which is not durable. For production, replace the implementation in `lib/db.ts` with Supabase, Neon, Postgres, Vercel storage, or another durable store. Keep the public route contracts the same so the UI does not need to change.

Suggested production tables:

```sql
create table marker_scans (
  player_id text not null,
  marker_id text not null,
  scanned_at timestamptz not null,
  user_agent text,
  primary key (player_id, marker_id)
);

create table saved_players (
  player_id text primary key,
  email text not null,
  saved_at timestamptz not null,
  recovery_code text
);
```

## Email Provider

The save/recover flow is present but email delivery is stubbed. TODO comments are in:

```text
lib/db.ts
```

To connect email, add Resend, SendGrid, Postmark, or another provider inside `saveProgress()` and `requestRecovery()`.

Recommended production flow:

1. Save the player email only after opt-in.
2. Generate a short-lived signed magic link or recovery code.
3. Send it by email.
4. Never show email in leaderboards or public UI.
5. Do not add passwords.

Useful environment variables:

```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=...
EMAIL_FROM=quest@famous.land
NEXT_PUBLIC_SITE_URL=https://famous.land
```

## Deploy To Vercel

GitHub Pages cannot run Next.js API routes. This app should be deployed to Vercel, Cloudflare Pages with Functions, or another Next-compatible serverless host.

For Vercel:

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Output directory: leave default.
6. Add `famous.land` and `www.famous.land` as domains in Vercel.
7. Move Cloudflare DNS from GitHub Pages to the Vercel DNS targets Vercel provides.
8. Add a real database before relying on cross-device persistence.
9. Add an email provider before relying on magic-link recovery.

## Existing GitHub Pages Note

The current domain was previously pointed at GitHub Pages. That static host can serve the old single-image page, but it cannot run `/api/scan`, `/api/progress`, `/api/save-progress`, or `/api/recover`. Switch the domain to a Next-compatible host when this game should go live.
