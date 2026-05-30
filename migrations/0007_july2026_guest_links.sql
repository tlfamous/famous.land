create table if not exists july2026_guest_links (
  slug text primary key,
  token text not null,
  created_at text not null,
  updated_at text not null,
  bound_device_id text,
  bound_at text,
  reset_at text
);

create unique index if not exists july2026_guest_links_token_idx
  on july2026_guest_links (token);

create index if not exists july2026_guest_links_bound_idx
  on july2026_guest_links (bound_at desc);
