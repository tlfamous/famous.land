-- 25 Sunny Cove: initial owner-only guide draft based on the live Airbnb listing.
-- Deliberately omit any unverified operating details, credentials, and access codes.

update homes
set
  rental_state = 'active',
  description = 'Lake Monomonac cottage with a private beach, dock, patio, kayaks, rowboat, full kitchen, Wi-Fi, AC, and parking.',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
where id = 'home_lh3';

insert into home_airbnb_listing_captures (
  id, home_id, listing_id, source_url, snapshot_json, captured_at, captured_by_session_id
) values (
  'lh3_airbnb_capture_20260718',
  'home_lh3',
  '1723418177705449341',
  'https://www.airbnb.com/hosting/listings/editor/1723418177705449341/details/photo-tour',
  '{"listingTitle":"Lake Monomonac Cottage with Private Beach & Dock","location":"25 Sunny Cove Rd, Winchendon, MA 01475, USA","propertySummary":"Entire place · House · 1 bedroom · 1 bed · 1 bath · 3 guests","description":"Relax at a lakefront cottage on a peninsula located on Lake Monomonac. Enjoy a private beach, dock, patio, kayaks, and row boat, with swimming, fishing, boating, and water sports. Inside is a cozy 1BR, 1BA cottage with a queen bed, child-size pull-out sofa, full kitchen, Wi-Fi, AC, and plenty of parking. Wooded hiking trails are within walking distance. Paid public boat ramp and marina access to the lake is available at North of the Border on Route 202.","amenities":["Air conditioning","BBQ grill","Beach access","Private beach","Dock","Patio","Kayaks","Row boat","Full kitchen","Wi-Fi","Parking"],"pricingSummary":"$200–$459 per night; 10% weekly discount; 25% monthly discount","availabilitySummary":"1–14 night stays; at least 1 day advance notice","bookingSettings":"Instant Book","houseRules":["Check-in after 3:00 PM","Checkout before 11:00 AM","3 guests maximum"],"safetyFeatures":["Carbon monoxide alarm installed","Smoke alarm installed"],"cancellationPolicy":"Flexible or Non-refundable"}',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  null
) on conflict(id) do nothing;

insert into home_guide_sections (
  id, home_id, section_type, title, body, display_order, secret_ref, created_at, updated_at
) values
  ('lh3_boundaries', 'home_lh3', 'boundaries', 'The cottage and grounds', '25 Sunny Cove is a lakefront cottage on a peninsula on Lake Monomonac. The private beach, dock, patio, and grounds are for cottage guests.', 10, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_policies', 'home_lh3', 'policies', 'House basics', 'The cottage accommodates up to 3 guests. Check-in is after 3:00 PM and checkout is before 11:00 AM. Airbnb provides stay-specific entry details.', 20, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_help', 'home_lh3', 'help', 'Need help?', 'If you have any issues, please message the host through Airbnb.', 30, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_kitchen', 'home_lh3', 'food', 'Kitchen', 'The cottage has a full kitchen for preparing meals during your stay.', 70, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_lake_safety', 'home_lh3', 'lake_safety', 'Lake safety', 'The cottage includes a private beach, dock, kayaks, and rowboat. Use the lake and watercraft safely, and follow applicable boating and swimming rules.', 90, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('lh3_checkout_towels', 'home_lh3', 'checkout', 'Checkout: towels', 'Gather used towels and put them in the laundry.', 110, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
on conflict(id) do nothing;
