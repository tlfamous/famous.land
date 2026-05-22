create table if not exists message_events (
  id text primary key,
  player_id text,
  recipient text not null,
  channel text not null,
  message_type text not null,
  provider text,
  provider_message_id text,
  status text not null,
  error text,
  created_at text not null
);

create index if not exists message_events_created_at_idx
  on message_events (created_at desc);

create index if not exists message_events_player_idx
  on message_events (player_id, created_at desc);

create table if not exists admin_audit_events (
  id text primary key,
  action text not null,
  player_id text,
  target text,
  result text not null,
  detail text,
  created_at text not null
);

create index if not exists admin_audit_events_created_at_idx
  on admin_audit_events (created_at desc);

create index if not exists admin_audit_events_player_idx
  on admin_audit_events (player_id, created_at desc);
