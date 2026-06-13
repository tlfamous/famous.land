alter table scan_events
  add column email_id text;

alter table scan_events
  add column progress_eligible integer not null default 1;

create index if not exists scan_events_progress_idx
  on scan_events (progress_eligible, scanned_at desc);
