create table if not exists game_settings (
  name text primary key,
  value text not null,
  updated_at text not null
);
