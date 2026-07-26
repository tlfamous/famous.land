-- Owner draft only: 25 Sunny Cove remains unlisted until its full guide is ready.
insert into home_guide_sections (
  id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
) values (
  'lh3_dining',
  'home_lh3',
  'food',
  'Dining near Lake Monomonac',
  'Approximate drive times from 25 Sunny Cove in normal traffic. Confirm current hours before heading out.' || char(10) || char(10) ||
  '- Hometown Diner — about 5 min — classic diner breakfast and lunch' || char(10) ||
  '- Emma''s 321 Pub & Kitchen — about 15 min — burgers, fish and chips, and American comfort food' || char(10) ||
  '- Phoenix Smokehouse — about 15 min — barbecue and takeout near the Rindge Walmart' || char(10) ||
  '- Sippin'' Serendipity — about 9 min — coffee, breakfast, and baked treats' || char(10) ||
  '- Koi Asian Cuisine & Lounge — about 10 min — Asian cuisine and takeout' || char(10) ||
  '- Little Anthony''s Restaurant — about 12 min — seafood and American classics' || char(10) ||
  '- The Grove at Woodbound Inn — about 19 min — brunch, lunch, and dinner in Rindge',
  130,
  null,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
) on conflict(id) do nothing;
