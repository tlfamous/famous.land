-- Refine the 25 Sunny Cove FAQ content while keeping the new boat-and-dock
-- guidance FAQ-only in the public handout.

update home_guide_sections
set
  body = case id
    when 'lh3_bathroom' then
      'The outdoor shower is propane on demand. There is no on/off button. Turn on the water with the lower shower knob; the system will activate automatically.' || char(10) || char(10) ||
      'Message the host if you have any trouble or questions about the setup.'
    when 'lh3_checkout_towels' then
      'Leave the bedding in place. Gather used towels and put them in the laundry.'
    else body
  end,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where home_id = 'home_lh3'
  and id in ('lh3_bathroom', 'lh3_checkout_towels');

insert into home_guide_sections (
  id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
) values (
  'lh3_boat_dock',
  'home_lh3',
  'water',
  'Can I bring my boat and use the dock?',
  'Yes. You may bring your boat and use the dock. To launch, use the public boat ramp at North of the Border, 1207 US-202, Rindge, NH 03461.',
  95,
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
