pragma foreign_keys = on;

-- Read-only mirrors of smart locks connected through Seam. Famous Land never
-- stores a door-code value or sends a lock/unlock command.
create table if not exists home_lock_devices (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  seam_device_id text not null unique,
  connected_account_id text,
  provider text not null,
  display_name text not null,
  model text,
  lock_state text not null default 'unknown'
    check (lock_state in ('locked', 'unlocked', 'unknown')),
  online integer not null default 0 check (online in (0, 1)),
  battery_level integer check (battery_level is null or (battery_level >= 0 and battery_level <= 100)),
  has_native_entry_events integer not null default 0 check (has_native_entry_events in (0, 1)),
  access_code_count integer not null default 0 check (access_code_count >= 0),
  last_event_at text,
  last_synced_at text not null,
  created_at text not null,
  updated_at text not null
);

create index if not exists home_lock_devices_home_idx
  on home_lock_devices (home_id, updated_at desc);
create index if not exists home_lock_devices_attention_idx
  on home_lock_devices (online, battery_level, updated_at desc);

create table if not exists home_lock_events (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
  lock_device_id text not null references home_lock_devices(id) on delete cascade,
  seam_device_id text not null,
  event_type text not null,
  occurred_at text not null,
  received_at text not null,
  access_code_id text,
  access_code_name text,
  method text,
  description text,
  metadata_json text
);

create index if not exists home_lock_events_home_time_idx
  on home_lock_events (home_id, occurred_at desc);
create index if not exists home_lock_events_device_time_idx
  on home_lock_events (seam_device_id, occurred_at desc);

-- Seed the two devices connected in the Famous Land Seam production workspace.
-- Status is refreshed immediately after rollout and then maintained by webhook.
insert or ignore into home_lock_devices (
  id, home_id, seam_device_id, connected_account_id, provider, display_name,
  model, lock_state, online, battery_level, has_native_entry_events,
  access_code_count, last_synced_at, created_at, updated_at
) values
  (
    'lock_lh2_schlage', 'home_lh2', '4f80fb1f-a8fa-47ea-932d-f9b7dacc7610',
    '8bfd1b19-7097-4f34-b14c-c6568667f9f2', 'Schlage', 'Pine Eden',
    'be499WB', 'locked', 1, 86, 1, 0,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'lock_lh3_yale', 'home_lh3', 'e010f900-122c-493d-a1c9-2bada43bf48a',
    'e6f5545f-be46-41fe-8997-c50f16de0682', 'Yale', 'Front Door',
    'Yale Assure for Andersen Patio Doors', 'unlocked', 1, 69, 1, 0,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
