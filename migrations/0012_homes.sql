pragma foreign_keys = on;

-- Shared operator authentication. Password material is never stored here; only
-- hashes of opaque sessions and coarse, non-PII rate-limit buckets are kept.
create table if not exists admin_sessions (
  id text primary key,
  token_hash text not null unique,
  auth_version text not null,
  created_at text not null,
  expires_at text not null,
  revoked_at text,
  last_seen_at text not null
);

create unique index if not exists admin_sessions_token_hash_idx
  on admin_sessions (token_hash);
create index if not exists admin_sessions_expires_at_idx
  on admin_sessions (expires_at);

create table if not exists admin_login_attempts (
  id text primary key,
  client_bucket text not null,
  attempted_at text not null,
  succeeded integer not null default 0 check (succeeded in (0, 1)),
  blocked_until text
);

create index if not exists admin_login_attempts_bucket_time_idx
  on admin_login_attempts (client_bucket, attempted_at desc);
create index if not exists admin_login_attempts_blocked_until_idx
  on admin_login_attempts (blocked_until);

create table if not exists homes (
  id text primary key,
  lh_code text not null unique,
  public_name text not null,
  slug text unique,
  rental_state text not null default 'unconfigured'
    check (rental_state in ('unconfigured', 'private', 'active', 'paused')),
  is_public integer not null default 0 check (is_public in (0, 1)),
  timezone text not null default 'America/New_York',
  address text,
  description text,
  private_notes text,
  created_at text not null,
  updated_at text not null
);

create index if not exists homes_rental_state_idx
  on homes (rental_state, is_public);

create trigger if not exists homes_only_active_rentals_are_public
before update of is_public, rental_state on homes
when new.is_public = 1 and new.rental_state != 'active'
begin
  select raise(abort, 'Only an active rental can have a public guide.');
end;

create trigger if not exists homes_maximum_two_public_guides
before update of is_public on homes
when new.is_public = 1 and old.is_public = 0
  and (select count(*) from homes where is_public = 1 and id != old.id) >= 2
begin
  select raise(abort, 'Only two home guides may be public.');
end;

create table if not exists home_guide_sections (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  section_type text not null check (
    section_type in (
      'boundaries', 'policies', 'help', 'wifi', 'water', 'waste',
      'food', 'bathroom', 'lake_safety', 'fire_pit', 'checkout'
    )
  ),
  title text not null,
  body text not null,
  display_order integer not null,
  secret_ref text,
  created_at text not null,
  updated_at text not null,
  unique (home_id, display_order)
);

create index if not exists home_guide_sections_home_idx
  on home_guide_sections (home_id, display_order);

create table if not exists home_guide_publications (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  revision integer not null check (revision > 0),
  snapshot_json text not null,
  content_hash text not null,
  published_at text not null,
  published_by_session_id text references admin_sessions(id) on delete set null,
  restored_from_publication_id text references home_guide_publications(id) on delete set null,
  print_page_count integer not null default 1,
  print_minimum_font_pt real not null default 9,
  print_has_overflow integer not null default 0 check (print_has_overflow in (0, 1)),
  unique (home_id, revision)
);

create index if not exists home_guide_publications_home_idx
  on home_guide_publications (home_id, revision desc);

-- Retired public slugs remain reserved forever. An exceptional slug change must
-- insert the exact old-to-new mapping before updating the home, which lets the
-- database distinguish that audited operation from an ordinary home update.
create table if not exists home_slug_redirects (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  old_slug text not null unique,
  new_slug text not null,
  created_by_session_id text references admin_sessions(id) on delete set null,
  created_at text not null,
  check (old_slug != new_slug)
);

create index if not exists home_slug_redirects_home_idx
  on home_slug_redirects (home_id, created_at desc);
create index if not exists home_slug_redirects_target_idx
  on home_slug_redirects (new_slug);

drop trigger if exists homes_slug_immutable_after_publication;
create trigger homes_slug_immutable_after_publication
before update of slug on homes
when old.slug is not new.slug
  and exists (
    select 1 from home_guide_publications publication
    where publication.home_id = old.id
  )
  and not exists (
    select 1 from home_slug_redirects redirect
    where redirect.home_id = old.id
      and redirect.old_slug = old.slug
      and redirect.new_slug = new.slug
  )
begin
  select raise(abort, 'A published home slug requires a permanent redirect.');
end;

create table if not exists home_manuals (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  title text not null,
  source_url text,
  r2_object_key text,
  file_name text,
  media_type text,
  byte_size integer,
  created_at text not null,
  updated_at text not null,
  check (source_url is not null or r2_object_key is not null)
);

create index if not exists home_manuals_home_idx
  on home_manuals (home_id, title);

create table if not exists home_inventory_items (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  name text not null,
  category text not null check (
    category in ('homekit', 'matter', 'smart_lock', 'network', 'appliance', 'safety', 'other')
  ),
  room text,
  make text,
  model text,
  serial_number text,
  homekit_enabled integer not null default 0 check (homekit_enabled in (0, 1)),
  matter_enabled integer not null default 0 check (matter_enabled in (0, 1)),
  airbnb_managed integer not null default 0 check (airbnb_managed in (0, 1)),
  manual_id text references home_manuals(id) on delete set null,
  manual_url text,
  operational_notes text,
  state text not null default 'unknown'
    check (state in ('ok', 'attention', 'offline', 'unknown')),
  last_verified_at text,
  created_at text not null,
  updated_at text not null
);

create index if not exists home_inventory_items_home_idx
  on home_inventory_items (home_id, state, category);

create table if not exists home_media (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  inventory_item_id text references home_inventory_items(id) on delete set null,
  title text not null,
  alt_text text,
  r2_object_key text not null unique,
  file_name text not null,
  media_type text not null,
  byte_size integer,
  width integer,
  height integer,
  visibility text not null default 'private' check (visibility in ('private', 'guide')),
  metadata_stripped integer not null default 1 check (metadata_stripped = 1),
  processed_at text not null,
  created_at text not null,
  updated_at text not null
);

create index if not exists home_media_home_idx
  on home_media (home_id, visibility, created_at desc);

create table if not exists home_secrets (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  secret_name text not null,
  ciphertext text not null,
  iv text not null,
  algorithm text not null default 'AES-GCM-256' check (algorithm = 'AES-GCM-256'),
  key_version integer not null default 1,
  created_at text not null,
  updated_at text not null,
  unique (home_id, secret_name)
);

create index if not exists home_secrets_home_idx
  on home_secrets (home_id, secret_name);

create table if not exists homes_audit_events (
  id text primary key,
  home_id text references homes(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  admin_session_id text references admin_sessions(id) on delete set null,
  detail_json text,
  created_at text not null
);

create index if not exists homes_audit_events_home_idx
  on homes_audit_events (home_id, created_at desc);

-- Known property identities only. Rental status remains an owner decision.
insert into homes (
  id, lh_code, public_name, slug, rental_state, is_public, timezone,
  address, description, private_notes, created_at, updated_at
) values
  (
    'home_lh1', 'LH1', 'Lake House 1', null, 'unconfigured', 0, 'America/New_York',
    '26 Sunny Cove Road, Winchendon, Massachusetts',
    'The original lake house with the Grand Peninsula and lake access.',
    null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'home_lh2', 'LH2', '63 Pine Eden', '63-pine-eden', 'unconfigured', 0, 'America/New_York',
    '63 Pine Eden Road, Rindge, New Hampshire',
    'A quiet lake house with two-zone air conditioning, a fireplace, and Starlink Internet.',
    null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'home_lh3', 'LH3', '25 Sunny Cove', null, 'unconfigured', 0, 'America/New_York',
    '25 Sunny Cove Road, Winchendon, Massachusetts',
    'The newest property, with an indoor-outdoor kitchen, large patio, beach, and lake access.',
    null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
on conflict (id) do nothing;

-- 63 Pine Eden starts as an editable draft. Wi-Fi values are deliberately not
-- embedded here; the wifi section resolves the encrypted wifi_credentials secret.
insert into home_guide_sections (
  id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
) values
  ('lh2_boundaries', 'home_lh2', 'boundaries', 'Property boundaries',
   'The property is bounded on either side by a line of large trees. Please do not go onto the neighboring property or docks; they are private property.',
   10, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_policies', 'home_lh2', 'policies', 'Smoking and pets',
   'No smoking. No pets.',
   20, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_help', 'home_lh2', 'help', 'Need help?',
   'Enjoy your stay. If you have any issues, please message the host through Airbnb.',
   30, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_wifi', 'home_lh2', 'wifi', 'Wi-Fi',
   'The current network name and password appear here and on the printed house sheet.',
   40, 'wifi_credentials', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_water', 'home_lh2', 'water', 'Water',
   'High quality water filter provided at the sink for drinking and cooking.',
   50, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_waste', 'home_lh2', 'waste', 'Trash and recycling',
   'Extra garbage goes in the bin on the front porch. Recycling goes in the blue basket under the oven.',
   60, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_food', 'home_lh2', 'food', 'Pantry',
   'Take or leave what you would like in the pantry and refrigerators.',
   70, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_bathroom', 'home_lh2', 'bathroom', 'Using the shower',
   'Adjust the temperature on the sink faucet, then pull up on the faucet latch.' || char(10) || char(10) || 'Post on the gram about the wacky plumbing in your AirBNB.',
   80, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_lake_safety', 'home_lh2', 'lake_safety', 'Boating',
   'Life preservers recommended for boating with Kayaks or canoe.',
   90, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_fire_pit', 'home_lh2', 'fire_pit', 'Fire pit',
   'Firewood is stored near the kayaks.',
   100, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_checkout_laundry', 'home_lh2', 'checkout', 'Checkout: towels',
   'Please place used towels in the bedroom laundry basket.',
   110, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh2_checkout_dishes', 'home_lh2', 'checkout', 'Checkout: dishes',
   'Please put dirty dishes in the dishwasher, add soap and press run.',
   120, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
on conflict (id) do nothing;
