create table if not exists marker_scans (
  player_id text not null,
  marker_id text not null,
  scanned_at text not null,
  user_agent text,
  primary key (player_id, marker_id)
);

create index if not exists marker_scans_player_idx
  on marker_scans (player_id, scanned_at);

create table if not exists saved_players (
  player_id text primary key,
  email text not null,
  saved_at text not null,
  recovery_code text not null
);

create index if not exists saved_players_email_idx
  on saved_players (email, saved_at);

create table if not exists recovery_requests (
  email text not null,
  requested_at text not null,
  mode text not null
);
