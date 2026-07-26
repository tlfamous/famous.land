-- Clarify where guests will find the trash and recycling bins at 25 Sunny Cove.
update home_guide_sections
set body = 'There are two trash bins in the kitchen island: one for trash and one for bottles and cans. An overflow trash bin is outside.',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where id = 'lh3_waste'
  and home_id = 'home_lh3';
