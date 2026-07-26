-- Add the no-smoking and no-pets policy to the 25 Sunny Cove guest guide.
insert into home_guide_sections (
  id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
) values (
  'lh3_smoking_pets',
  'home_lh3',
  'policies',
  'Smoking and pets',
  'No smoking. No pets.',
  25,
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
