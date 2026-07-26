-- Clarify how the Pine Eden shower diverter operates in the draft guide.
update home_guide_sections
set
  body = 'Adjust the temperature on the sink faucet, then pull down on the faucet spout to activate the shower.' || char(10) || char(10) ||
    'Post on the gram about the wacky plumbing in your AirBNB.',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where id = 'lh2_bathroom' and home_id = 'home_lh2';
