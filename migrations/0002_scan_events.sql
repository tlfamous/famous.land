create table if not exists scan_events (
  id text primary key,
  player_id text not null,
  marker_id text not null,
  scanned_at text not null,
  user_agent text
);

create index if not exists scan_events_scanned_at_idx
  on scan_events (scanned_at desc);

create index if not exists scan_events_marker_idx
  on scan_events (marker_id, scanned_at);

insert or ignore into scan_events (id, player_id, marker_id, scanned_at, user_agent)
select
  'legacy:' || player_id || ':' || marker_id,
  player_id,
  marker_id,
  scanned_at,
  user_agent
from marker_scans;
