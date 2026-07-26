-- The restaurant list is intentionally part of the owner draft; publishing controls public visibility.
insert into home_guide_sections (
  id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
) values (
  'lh2_dining',
  'home_lh2',
  'food',
  'Dining near 63 Pine Eden',
  'Approximate drive times from 63 Pine Eden in normal traffic. Confirm current hours before heading out.' || char(10) || char(10) ||
  '- Emma''s 321 Pub & Kitchen — about 3 min — burgers, fish and chips, and American comfort food' || char(10) ||
  '- Hometown Diner — about 4 min — classic diner breakfast and lunch' || char(10) ||
  '- Phoenix Smokehouse — about 7 min — barbecue and takeout near the Rindge Walmart' || char(10) ||
  '- The Grove at Woodbound Inn — about 9 min — brunch, lunch, and dinner in Rindge' || char(10) ||
  '- Dublin Road Taproom & Eatery — about 14 min — pub fare, comfort food, and rotating draft beers in Jaffrey',
  105,
  null,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
) on conflict(id) do nothing;
