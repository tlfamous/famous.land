-- Famous Land keeps one current published guide per home. Historical guide
-- snapshots and restore metadata are deliberately discarded.
create table home_published_guides (
  id text primary key,
  home_id text not null unique references homes(id) on delete cascade,
  snapshot_json text not null,
  content_hash text not null,
  published_at text not null,
  published_by_session_id text references admin_sessions(id) on delete set null,
  print_page_count integer not null default 2,
  print_minimum_font_pt real not null default 9,
  print_has_overflow integer not null default 0 check (print_has_overflow in (0, 1))
);

insert into home_published_guides (
  id, home_id, snapshot_json, content_hash, published_at,
  published_by_session_id, print_page_count, print_minimum_font_pt,
  print_has_overflow
)
select
  publication.id,
  publication.home_id,
  publication.snapshot_json,
  publication.content_hash,
  publication.published_at,
  publication.published_by_session_id,
  publication.print_page_count,
  publication.print_minimum_font_pt,
  publication.print_has_overflow
from home_guide_publications publication
where not exists (
  select 1
  from home_guide_publications newer
  where newer.home_id = publication.home_id
    and newer.revision > publication.revision
);

drop trigger if exists homes_slug_immutable_after_publication;
drop table home_guide_publications;
