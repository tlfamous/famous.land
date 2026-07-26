-- Make the Pine Eden Wi-Fi wording evergreen for both the online and printed guide.
update home_guide_sections
set
  body = 'The network name and password appear here and on the printed house sheet.',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where id = 'lh2_wifi';
