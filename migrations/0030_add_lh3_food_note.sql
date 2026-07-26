-- Let Sunny Cove guests know they are welcome to use or leave food in the kitchen.
insert into home_guide_sections (
  id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
) values (
  'lh3_food',
  'home_lh3',
  'food',
  'Food',
  'Take or leave what you would like from the kitchen cabinets and refrigerator.',
  75,
  null,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
on conflict(id) do update set
  section_type = excluded.section_type,
  title = excluded.title,
  body = excluded.body,
  display_order = excluded.display_order,
  secret_ref = excluded.secret_ref,
  updated_at = excluded.updated_at;
