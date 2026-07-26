-- Apply the approved 25 Sunny Cove guest-guide corrections, then preserve them
-- as the next immutable publication revision. The latest snapshot carries the
-- encrypted Wi-Fi envelope and any guide media forward unchanged.

update home_guide_sections
set
  body = case id
    when 'lh3_lock' then
      'Use the stay-specific code provided by Airbnb.' || char(10) || char(10) ||
      'To unlock:' || char(10) ||
      '1. Touch the screen with your palm or the back of your hand to activate it.' || char(10) ||
      '2. Enter the code, then tap the check icon.' || char(10) ||
      '3. The lock will play a happy sound and unlock.' || char(10) || char(10) ||
      'To lock:' || char(10) ||
      '1. Close the door.' || char(10) ||
      '2. Pull up on the handle to pull the door tight.' || char(10) ||
      '3. Touch the screen with your palm or the back of your hand.' || char(10) ||
      '4. The lock will play a happy sound and lock.'
    when 'lh3_kitchen' then
      'The cottage has a full kitchen for preparing meals during your stay. The outdoor gas grill must be lit with a lighter; its electronic starter is disabled.' || char(10) || char(10) ||
      'Paper plates and plastic forks are available if you prefer not to wash dishes.'
    when 'lh3_bathroom' then
      'The cottage has an indoor bathroom and an outdoor shower. Message the host through Airbnb if you need help using the shower.'
    when 'lh3_checkout_dishes' then
      'Clean any remaining dishes and place them in the drying rack.'
    else body
  end,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where home_id = 'home_lh3'
  and id in ('lh3_lock', 'lh3_kitchen', 'lh3_bathroom', 'lh3_checkout_dishes');

delete from home_guide_sections
where id = 'lh3_fire_pit' and home_id = 'home_lh3';

with latest_publication as (
  select *
  from home_guide_publications
  where home_id = 'home_lh3'
  order by revision desc
  limit 1
), guide_sections as (
  select json_group_array(json(section_json)) as sections_json
  from (
    select json_object(
      'id', id,
      'sectionType', section_type,
      'title', title,
      'body', body,
      'displayOrder', display_order,
      'secretRef', secret_ref
    ) as section_json
    from home_guide_sections
    where home_id = 'home_lh3'
    order by display_order
  )
)
insert into home_guide_publications (
  id, home_id, revision, snapshot_json, content_hash, published_at,
  published_by_session_id, restored_from_publication_id,
  print_page_count, print_minimum_font_pt, print_has_overflow
)
select
  lower(hex(randomblob(16))),
  latest_publication.home_id,
  latest_publication.revision + 1,
  json_set(latest_publication.snapshot_json, '$.sections', json(guide_sections.sections_json)),
  lower(hex(randomblob(32))),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  null,
  null,
  2,
  9,
  0
from latest_publication
cross join guide_sections;
