pragma foreign_keys = on;
pragma defer_foreign_keys = true;

create table home_activity_events_v2 (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  source text not null check (source in ('seam', 'eero', 'mopeka', 'econet', 'system')),
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

insert into home_activity_events_v2 (
  id, home_id, source, source_event_id, event_type, occurred_at, received_at,
  device_id, device_name, description, metadata_json, sensitive_ciphertext,
  sensitive_iv, sensitive_algorithm, sensitive_key_version
)
select
  id, home_id, source, source_event_id, event_type, occurred_at, received_at,
  device_id, device_name, description, metadata_json, sensitive_ciphertext,
  sensitive_iv, sensitive_algorithm, sensitive_key_version
from home_activity_events;

drop table home_activity_events;
alter table home_activity_events_v2 rename to home_activity_events;

create index home_activity_events_home_time_idx
  on home_activity_events (home_id, occurred_at desc);

create table home_integrations (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  provider text not null check (provider in ('mopeka', 'econet')),
  status text not null check (
    status in ('verification_pending', 'connected', 'needs_reauthorization', 'error')
  ),
  account_hint text,
  external_device_id text,
  external_device_name text,
  external_location_id text,
  external_location_name text,
  metadata_json text,
  credentials_ciphertext text not null,
  credentials_iv text not null,
  credentials_algorithm text not null,
  credentials_key_version integer not null,
  poll_interval_minutes integer not null default 60 check (poll_interval_minutes >= 15),
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  last_attempt_at text,
  last_success_at text,
  next_poll_at text,
  last_error text,
  created_at text not null,
  updated_at text not null,
  unique (home_id, provider)
);

create index home_integrations_due_idx
  on home_integrations (status, next_poll_at);

create table home_equipment_readings (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  integration_id text not null references home_integrations(id) on delete cascade,
  provider text not null check (provider in ('mopeka', 'econet')),
  external_device_id text not null,
  observed_at text not null,
  source_updated_at text,
  online integer not null check (online in (0, 1)),
  metrics_json text not null,
  created_at text not null,
  unique (integration_id, observed_at)
);

create index home_equipment_readings_home_time_idx
  on home_equipment_readings (home_id, observed_at desc);

create index home_equipment_readings_integration_time_idx
  on home_equipment_readings (integration_id, observed_at desc);

create table home_alerts (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  integration_id text not null references home_integrations(id) on delete cascade,
  provider text not null check (provider in ('mopeka', 'econet')),
  device_name text not null,
  dedupe_key text not null,
  alert_type text not null,
  severity text not null check (severity in ('warning', 'critical')),
  status text not null check (status in ('open', 'acknowledged', 'resolved')),
  title text not null,
  description text not null,
  opened_at text not null,
  last_observed_at text not null,
  acknowledged_at text,
  acknowledged_by_session_id text,
  resolved_at text,
  created_at text not null,
  updated_at text not null
);

create unique index home_alerts_active_dedupe_idx
  on home_alerts (dedupe_key)
  where status in ('open', 'acknowledged');

create index home_alerts_home_status_idx
  on home_alerts (home_id, status, opened_at desc);

create index home_alerts_portfolio_idx
  on home_alerts (status, severity, opened_at desc);
