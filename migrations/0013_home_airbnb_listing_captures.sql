-- Owner-only, read-only captures from the Airbnb listing editor. These are
-- intentionally not a PMS/API sync and are never queried by public guides.
create table if not exists home_airbnb_listing_captures (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  listing_id text,
  source_url text not null,
  snapshot_json text not null,
  captured_at text not null,
  captured_by_session_id text references admin_sessions(id) on delete set null
);

create index if not exists home_airbnb_listing_captures_home_idx
  on home_airbnb_listing_captures (home_id, captured_at desc);
