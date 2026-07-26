-- Clarify the Pine Eden checkout instructions for bedding and towels.
update home_guide_sections
set
  body = 'Leave linens on beds. Place used towels in the bedroom laundry basket.',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where id = 'lh2_checkout_laundry';
