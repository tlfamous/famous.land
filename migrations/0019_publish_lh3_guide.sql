-- Publish the first editable guide for 25 Sunny Cove. Interim entries point guests to
-- Airbnb until the owner replaces them with verified house-specific instructions.
update homes
set slug = '25-sunny-cove', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where id = 'home_lh3' and slug is null;

insert into home_guide_sections (
  id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
) values
  ('lh3_wifi', 'home_lh3', 'wifi', 'Wi-Fi', 'Wi-Fi details will be added here shortly. If you need help connecting, please message the host through Airbnb.', 40, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_water', 'home_lh3', 'water', 'Water', 'For questions about drinking water, please message the host through Airbnb.', 50, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_waste', 'home_lh3', 'waste', 'Trash and recycling', 'Please keep trash and recycling contained and message the host through Airbnb for the current bin and pickup instructions.', 60, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_bathroom', 'home_lh3', 'bathroom', 'Bathrooms and outdoor shower', 'The cottage has an indoor bathroom and an outdoor shower. Please leave both tidy and message the host through Airbnb if you need help using the shower.', 80, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_fire_pit', 'home_lh3', 'fire_pit', 'Fires', 'Do not light fires on the cottage grounds unless the host has confirmed a designated fire area.', 100, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_checkout_dishes', 'home_lh3', 'checkout', 'Checkout: dishes', 'Please wash any used dishes before checkout.', 120, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
on conflict(id) do nothing;

insert into home_guide_publications (
  id, home_id, revision, snapshot_json, content_hash, published_at,
  published_by_session_id, restored_from_publication_id,
  print_page_count, print_minimum_font_pt, print_has_overflow
)
select
  'lh3_publication_1',
  homes.id,
  1,
  json_object(
    'publicName', homes.public_name,
    'slug', homes.slug,
    'timezone', homes.timezone,
    'sections', json((
      select json_group_array(json(section_json))
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
        where home_id = homes.id
        order by display_order
      )
    )),
    'media', json('[]')
  ),
  '7c21864901dec87c8048392b7ff38a6542cd5ae3271f2318bd34449f44a54f0f',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  null,
  null,
  2,
  9,
  0
from homes
where homes.id = 'home_lh3'
on conflict(id) do nothing;

update homes
set is_public = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where id = 'home_lh3'
  and exists (select 1 from home_guide_publications where id = 'lh3_publication_1');
