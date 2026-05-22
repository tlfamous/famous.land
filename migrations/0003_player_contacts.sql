create table if not exists player_contacts (
  player_id text primary key,
  email text,
  phone_number text,
  email_updated_at text,
  phone_updated_at text,
  created_at text not null,
  updated_at text not null
);

create index if not exists player_contacts_email_idx
  on player_contacts (email);

create index if not exists player_contacts_phone_idx
  on player_contacts (phone_number);

insert into player_contacts (
  player_id,
  email,
  phone_number,
  email_updated_at,
  phone_updated_at,
  created_at,
  updated_at
)
select
  player_id,
  email,
  null,
  saved_at,
  null,
  saved_at,
  saved_at
from saved_players
where true
on conflict(player_id) do update set
  email = excluded.email,
  email_updated_at = excluded.email_updated_at,
  updated_at = excluded.updated_at;
