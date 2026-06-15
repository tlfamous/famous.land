alter table player_contacts add column name text;
alter table player_contacts add column name_updated_at text;

create index if not exists player_contacts_name_idx
  on player_contacts (name);
