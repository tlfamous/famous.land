-- Clarify the guest capacity and sleeping arrangement for 25 Sunny Cove.

update home_guide_sections
set
  body = 'The cottage accommodates up to three guests: one queen bed and one small pull-out couch. Check-in is after 3:00 PM and checkout is before 11:00 AM. Airbnb provides stay-specific entry details.',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where id = 'lh3_policies' and home_id = 'home_lh3';
