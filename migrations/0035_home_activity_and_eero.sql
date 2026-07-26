pragma foreign_keys = on;

create table if not exists home_activity_events (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  source text not null check (source in ('seam', 'eero')),
  source_event_id text not null,
  event_type text not null,
  occurred_at text not null,
  received_at text not null,
  device_id text,
  device_name text,
  description text,
  metadata_json text,
  sensitive_ciphertext text,
  sensitive_iv text,
  sensitive_algorithm text,
  sensitive_key_version integer,
  unique (source, source_event_id)
);

create index if not exists home_activity_events_home_time_idx
  on home_activity_events (home_id, occurred_at desc);

create table if not exists home_network_integrations (
  id text primary key,
  home_id text not null unique references homes(id) on delete cascade,
  provider text not null check (provider = 'eero'),
  status text not null check (status in ('unconfigured', 'verification_pending', 'connected', 'needs_reauthorization', 'error')),
  account_hint text,
  network_id text,
  network_name text,
  session_ciphertext text,
  session_iv text,
  session_algorithm text,
  session_key_version integer,
  baseline_established integer not null default 0 check (baseline_established in (0, 1)),
  last_synced_at text,
  last_error text,
  created_at text not null,
  updated_at text not null
);

create table if not exists home_network_device_states (
  integration_id text not null references home_network_integrations(id) on delete cascade,
  device_id text not null,
  online integer not null check (online in (0, 1)),
  updated_at text not null,
  primary key (integration_id, device_id)
);

insert or ignore into home_activity_events (
  id, home_id, source, source_event_id, event_type, occurred_at, received_at,
  device_id, device_name, description, metadata_json
)
select
  'seam:' || id, home_id, 'seam', id, event_type, occurred_at, received_at,
  seam_device_id, null, description, metadata_json
from home_lock_events;
