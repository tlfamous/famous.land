alter table scan_events
  add column is_test integer not null default 0;

create index if not exists scan_events_is_test_idx
  on scan_events (is_test, scanned_at desc);
