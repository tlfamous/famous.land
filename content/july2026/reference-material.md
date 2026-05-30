# Lake Weekend Guest Website Reference Document

## 1. Project Overview

Create a polished, playful, luxury-resort-inspired guest website for a private lake weekend from Friday, July 3 through Sunday, July 5, 2026.

The site should feel like a boutique resort experience, but still be practical and clear. Guests should be able to see their personalized lodging details, weekend schedule, house information, maps, activity options, and host contact information.

The theme should lean into the idea that the three lake houses are part of a fictional “resort” experience.

## 2. Core Website Goals

The website should help guests quickly answer:

- Where am I staying?
- What room am I assigned to?
- What is the weekend schedule?
- Where are the lake houses?
- What activities are available?
- Where do I go for each event?
- Who do I contact if I need help?

The site should also create a fun “check-in” experience where each guest opens a personalized link and sees their own room assignment and itinerary.

## 3. Personalization and Guest Links

Each guest should receive a unique link or token.

When a guest opens their link, the site identifies them and displays their personalized view by default.

The personalized view should include:

- Guest name
- Assigned lake house
- Assigned room
- Arrival/check-in information
- Departure/check-out information
- Relevant schedule details
- House-specific itinerary highlights
- Host contact/help button
- Ability to view other guest assignments if desired

### Identity Binding Behavior

Current implementation: the first guest link opened on a device binds that guest identity through the `/api/july2026/guest-bindings` service and also stores the active identity locally in the browser.

If a different guest link is opened later on the same device, it does not overwrite the original device/session binding. The page shows the viewed guest details while making clear that the device remains checked in as the originally bound guest.

The backend guest-link store records each guest slug, token, current binding state, and reset/regeneration timestamps.

The admin page includes a local reset control for the current device plus persistent regenerate/reset controls for each guest link.

### Calendar File

The guest portal exposes a downloadable calendar file at `/july2026/calendar.ics`.

The calendar includes the full July 3-5 weekend block plus major guest events:

- Guest check-in
- Friday welcome meal
- Friday weekend orientation
- Saturday yoga
- Saturday motorized lake vehicle orientation
- Saturday group boat ride
- Saturday dinner
- Saturday fireworks viewing
- Sunday pancake brunch

Each guest room-key page also exposes a personal calendar file at `/july2026/guest/{slug}/calendar.ics`.

The personal calendar includes:

- The guest's current assignment, or pending-assignment language when needed
- Arrival and departure notes
- Personal room-key URL
- Personal room-key packet URL
- Host SMS line

### Host Contact Card

The guest portal exposes a downloadable host contact card at `/july2026/host-contact.vcf`.

The contact card saves:

- Name: Famous Land Host
- Organization: famous.land
- Mobile: 781-929-4932
- Website: https://famous.land/july2026

### Offline Weekend Guide

The guest portal exposes a downloadable plain-text guide at `/july2026/weekend-guide.txt`.

The offline guide includes:

- Event portal, host text line, host contact card, and calendar links
- Arrival instructions
- Arrival checklist and host text template prompts
- Getting Around house flow
- LH1, LH2, and LH3 directory notes
- Key schedule
- What to bring
- Lake and host approval notes

Each guest room-key page also exposes a personalized downloadable room-key packet at `/july2026/guest/{slug}/packet.txt`.

The personalized packet includes:

- Guest name
- Current house and room assignment, or pending-assignment language when still awaiting host confirmation
- Companions
- Arrival and departure details
- House note and house-specific itinerary highlights
- Weekend essentials
- Links to the room key, guest portal, calendar, offline guide, and host contact card
- Host SMS line and approval notes

### Admin Page

The admin page should show:

- List of all guests
- Each guest’s assigned house and room
- Whether the current browser has a completed first-device binding
- Persistent guest-link service status
- Ability to generate or regenerate a guest link with a fresh token-style query string
- Ability to reset a guest binding if needed
- Ability to copy one SMS-ready packet of all current room-key links
- Ability to copy a guest-specific SMS packet with assignment, room-key link, calendar, offline guide, host contact, and arrival notes
- Ability to copy a missing-content request packet for the remaining host-supplied address, room assignment, photo, and checkout details
- Readiness tracker for live, partial, and still-needed launch content

## 4. Houses

Each house should have a dedicated profile page or section with:

- House name
- Address
- Google Maps link
- Photos
- Key gathering spaces
- Any relevant notes or amenities

### LH1

Address: TBD

Google Maps link: pending until address is confirmed.

Known spaces/events:

- Sunroom
- Great Room 1
- Grand Peninsula
- South Grand Peninsula fire pit
- Dock/boat departure point

Photos needed:

- Exterior of LH1: provided as LH1 aerial photo
- Sunroom
- Great Room 1
- Grand Peninsula
- South Grand Peninsula fire pit
- Relevant bedrooms

### LH2

Address: 63 Pine Eden Road, Rindge, New Hampshire

Google Maps link: `https://www.google.com/maps/search/?api=1&query=63%20Pine%20Eden%20Road%2C%20Rindge%2C%20NH`

Known spaces:

- South bedroom
- North bedroom

Photos needed:

- Exterior of LH2
- South bedroom
- North bedroom
- Any common spaces

### LH3

Address: 25 Sunny Cove Road, Winchendon, Massachusetts

Google Maps link: `https://www.google.com/maps/search/?api=1&query=25%20Sunny%20Cove%20Road%2C%20Winchendon%2C%20MA`

Known spaces/events:

- Beach
- Lunch/dinner/brunch gathering location
- Primary bedroom
- Boat return point

Photos needed:

- Exterior of LH3
- Beach
- Primary bedroom
- Dining/gathering area
- Smoothie/lunch/dinner/brunch area

## 5. Guest and Room Assignments

### LH1

| Guest(s) | Room |
|---|---|
| Heather and Eric | Second floor bedroom |
| Morgan, Rowan, Emma, and Austin | Third floor bedroom, labeled “The Girls’ Room” |
| Jack | Sunroom |

### LH2

| Guest(s) | Room |
|---|---|
| Cin and Vin | South bedroom |
| Adam and Gage | North bedroom |

### LH3

| Guest(s) | Room |
|---|---|
| Holly and Todd | Primary bedroom |

### Total Guests

15 guests:

- Holly
- Todd
- Heather
- Eric
- Zach
- Bee
- Cin
- Vin
- Adam
- Gage
- Morgan
- Rowan
- Emma
- Austin
- Jack

### Personalized Guest Links

Each guest has a persistent room-key URL. The admin page generates token-style URLs by appending `?t=...`.

| Guest | URL | Current assignment |
|---|---|---|
| Holly | `/july2026/guest/holly` | LH3 / Primary bedroom |
| Todd | `/july2026/guest/todd` | LH3 / Primary bedroom |
| Heather | `/july2026/guest/heather` | LH1 / Second floor bedroom |
| Eric | `/july2026/guest/eric` | LH1 / Second floor bedroom |
| Zach | `/july2026/guest/zach` | Assignment pending |
| Bee | `/july2026/guest/bee` | Assignment pending |
| Cin | `/july2026/guest/cin` | LH2 / South bedroom |
| Vin | `/july2026/guest/vin` | LH2 / South bedroom |
| Adam | `/july2026/guest/adam` | LH2 / North bedroom |
| Gage | `/july2026/guest/gage` | LH2 / North bedroom |
| Morgan | `/july2026/guest/morgan` | LH1 / The Girls' Room |
| Rowan | `/july2026/guest/rowan` | LH1 / The Girls' Room |
| Emma | `/july2026/guest/emma` | LH1 / The Girls' Room |
| Austin | `/july2026/guest/austin` | LH1 / The Girls' Room |
| Jack | `/july2026/guest/jack` | LH1 / Sunroom |

Opening one of these links on a device records the first guest identity. Opening a different guest link afterward does not replace that stored check-in unless the local device binding is reset. If a tokenized link is already bound to another device or the token no longer matches, the guest page tells the guest to text the host for a fresh link.

Base guest-directory URLs without `?t=...` are browsable but should not claim the persistent backend room-key binding. Persistent first-device binding is for tokenized links generated from admin.

If a guest has an assignment pending, the guest page should show a host-confirmation notice instead of presenting “Pending” as a finished room assignment. The guest should be prompted to text the host for the current lodging details.

## 6. Weekend Schedule

## Friday, July 3, 2026

### 3:00 p.m. to 6:00 p.m.  
Guest Check-In Window

Guests arrive and settle into their assigned lake house and room.

### 6:30 p.m.  
Casual Grab-and-Go Meal

Location: Sunroom, LH1

A casual, flexible meal after check-in.

### 7:00 p.m. to 8:00 p.m.  
Weekend Orientation

Location: Great Room 1, LH1

Overview of the weekend, key locations, schedule, activities, and safety/logistics.

### 8:00 p.m.  
Campfire, Cigars, and Scotch

Location: Grand Peninsula, LH1

Relaxed evening gathering with fire, cigars, and scotch for those who partake.

## Saturday, July 4, 2026

### 7:30 a.m. to 8:00 a.m.  
Coffee Time at All Houses

Each house has its own coffee experience:

- LH1: Kona coffee
- LH2: K-cup coffee
- LH3: Drip coffee

Guests may visit any house for coffee.

### 8:00 a.m.  
Yoga on the Beach

Location: Beach, LH3

Morning yoga by the lake.

### 9:00 a.m.  
Non-Motorized Lake Activities

Location: LH3 / Lake access

Activities include:

- Kayaks
- Canoes
- Rowboats
- Swimming

### 10:00 a.m.  
Fruit Smoothies

Location: LH3

Refreshing smoothies after morning lake activities.

### 11:00 a.m.  
Motorized Lake Vehicle Orientation

Location: LH1

Safety briefing and orientation for motorized lake vehicles, including boats or similar lake equipment.

### 11:30 a.m. to 12:30 p.m.  
Boat Ride

Departure: LH1  
Return: LH3

Group boat ride across the lake.

### 12:30 p.m.  
Lunch

Location: LH3

Lunch begins immediately after the boat ride returns.

### 2:00 p.m. to 6:00 p.m.  
Free Time and Optional Activities

Guests may choose from:

- Hiking at Famous Land
- Famous Land quests
- Motorized boating
- Non-motorized boating
- Beach and lounging activities
- Quad/four-wheeler by request or reservation
- Napping or downtime

### 2:00 p.m.  
Fourth of July Boat Parade

Guests may see the boat parade during afternoon free time.

Expected viewing note: The parade may pass by LH3 around 3:00 p.m.

### 6:00 p.m.  
Dinner

Location: LH3

Lakeside patio seating.

### 8:00 p.m.  
S’mores at the Fire Pit

Location: South Grand Peninsula, LH1

Evening fire pit gathering with s’mores.

### 8:30 p.m.  
Sparklers and Snacks

Location: South Grand Peninsula / LH1 area unless otherwise specified

Evening snacks and sparklers after s’mores.

### 9:00 p.m.  
Optional Fireworks Viewing

Viewing options:

- Grand Peninsula at LH1
- Beach at LH3
- Chartered cruise experience on the lake

## Sunday, July 5, 2026

### 8:30 a.m.  
Coffee Time at All Houses

Same coffee setup as Saturday:

- LH1: Kona coffee
- LH2: K-cup coffee
- LH3: Drip coffee

### 10:00 a.m.  
Pancake Brunch

Location: LH3

Relaxed Sunday brunch.

### After Brunch  
Free Time and Lake Activities

Guests may continue enjoying the lake, lounging, hiking, boating, or relaxing.

### Sunday Afternoon  
Departure and Grab-and-Go Food

Grab-and-go food available for guests as they depart.

## 7. Activity List

The guest page includes a dedicated Activities section with scan-friendly cards for:

- Beach and swimming at LH3
- Kayaks, canoes, and rowboats from LH3 / lake access
- Motorized lake fleet after the LH1 orientation
- Famous Land quests and hiking during free time
- Campfire, s’mores, sparklers, and fireworks viewing from LH1 / LH3

Activity approval rules:

- Motorized lake fleet use requires the Saturday LH1 orientation and host approval.
- Optional fireworks cruise plans are by host approval.
- Quad/four-wheeler use is by host approval.
- Dietary notes, allergies, or restrictions should be texted to the host at 781-929-4932.

## 8. Lake Use and Approval Guide

The guest page includes a dedicated Lake Rules section with:

- Orientation first: motorized fleet use starts only after the Saturday LH1 safety briefing and a host go-ahead.
- Life jackets: guests should wear the right-size life jacket for boating, PWC rides, and any lake activity where the host asks for one.
- Dock plan: guests should use the host-designated departure and return points, especially for the LH1-to-LH3 group boat ride.
- Text before changes: guests should text the host before changing cruise plans, taking out a motorized vehicle, or requesting quad/four-wheeler time.

## 9. Food and Drinks

The guest page includes a dedicated Food and Drinks section with:

- Friday grab-and-go welcome meal in the LH1 sunroom
- Saturday coffee at all houses
- Saturday fruit smoothies at LH3
- Saturday lunch at LH3
- Saturday dinner at LH3 with lakeside patio seating
- Sunday pancake brunch at LH3

## 10. Motorized Vehicle Inventory

| Name | Vehicle | Color | Capacity | Best for | Start point | Approval | Reference image | Operating note |
|---|---|---|---|---|---|---|---|---|
| Laconic | Sea-Doo Switch Cruise pontoon boat | Red | 10 persons | Group cruise, boat parade viewing, and relaxed lake runs | LH1 dock / host-designated departure point | Host orientation required before use | Red Sea-Doo Switch Cruise 23 ft studio-style reference | Primary group pontoon for lake runs, boat parade viewing, and the Saturday LH1-to-LH3 ride after host orientation. |
| Spikey Lizard | Sea-Doo PWC | Blue | 3 seats | Three-seat PWC rides after the safety briefing | Host-approved lake launch point | Host orientation and PWC go-ahead required | Blue Sea-Doo GTX studio reference | Personal watercraft for approved lake use after the Saturday safety briefing. |
| Laika | Sea-Doo Spark Trixx | Red | 2 seats | Compact two-seat Trixx-style PWC outings | Host-approved lake launch point | Host orientation and PWC go-ahead required | Red Sea-Doo Spark Trixx 2up studio reference | Compact Trixx-style PWC for host-approved lake use after orientation. |

Inventory notes:

- The website stores the vehicle reference images inside the July 2026 asset folder.
- The three inventory cards should look visually similar, using clean studio-style Sea-Doo watercraft references.
- The guest fleet cards show best-use, start-point, and approval notes so guests know what to text the host about.
- All motorized vehicle use is part of the host-approved activity flow.

## 11. Guest Experience Requirements

The site should feel like a fun resort portal.

Suggested sections:

- Welcome / Check-In
- Resort Desk quick guide
- Arrival Desk checklist
- Host text templates
- Add Calendar
- Add My Calendar
- Save Host Contact
- Offline Guide
- My Stay
- My Room
- Downloadable personal room-key packet
- Weekend Itinerary
- Houses
- Activities
- Motorized Fleet
- Lake Rules and Approvals
- Food and Drinks
- Maps and Directions with known LH2 and LH3 address links
- Getting Around guide for house-to-house weekend flow
- Help / Contact Host
- View Other Guests
- Admin

Admin operating sections:

- Planning summary
- Reference checkpoints
- Launch readiness tracker
- Asset and content checklist showing live bundled media and missing host-supplied content
- Missing-content request packet for launch-completion follow-up
- Resort Desk readiness
- Arrival Desk readiness
- Calendar file readiness
- Personalized calendar readiness
- Host contact card readiness
- Offline guide readiness
- Guest-link packet readiness
- Guest-specific SMS packet readiness
- Personalized room-key packet readiness
- Personalized itinerary readiness
- Getting Around readiness
- Motorized vehicle inventory
- Lake rules readiness
- Personalized room-key URLs
- Embedded reference material with Proof edit link

Getting Around guide:

- Arrive at your assigned house using the guest room-key page; LH2 and LH3 directions are live, and LH1 directions remain pending until the host confirms the address.
- Friday starts at LH1 for the welcome meal, orientation, and first-night fire gathering.
- Saturday morning shifts to LH3 for yoga, beach time, non-motorized boats, smoothies, lunch, dinner, and Sunday brunch.
- The Saturday group boat ride connects LH1 to LH3 after the motorized fleet orientation.

Arrival Desk checklist:

- Before guests leave: open the room-key link, save the host contact, and add the weekend calendar.
- Arrival: go to the assigned house, settle into the assigned room, then use the schedule for the Friday LH1 welcome flow.
- Friday night: LH1 sunroom for the 6:30 p.m. grab-and-go meal, then Great Room 1 for the 7:00 p.m. orientation.
- Saturday lake day: start at LH3 for yoga and lake time, then wait for the 11:00 a.m. LH1 orientation before motorized fleet use.

Host text templates:

- Room help: "Hi, I need help with my July 4th weekend room assignment or arrival directions."
- Dietary note: "Hi, I have a dietary note for the July 4th weekend:"
- Fleet approval: "Hi, I would like host approval or timing guidance for motorized lake fleet use."
- Link reset: "Hi, my July 2026 room-key link needs a reset or fresh token."

Guest-specific SMS packets:

- Admin guest rows can copy a message for one guest at a time.
- Admin guest rows show a preview of the guest-specific SMS packet before copying.
- Each packet includes the tokenized room-key link when available, personal calendar link, personal packet link, current assignment, arrival and departure notes, calendar link, offline guide link, host contact card link, and host SMS number.
- Pending guests receive language that their assignment still needs host confirmation instead of a false house or room.

Personal room-key packets:

- Each guest page links to a downloadable plain-text personal packet.
- Packet route pattern: `/july2026/guest/{slug}/packet.txt`.
- The packet is suitable for offline reference and includes house-specific highlights plus the core weekend links.
- Personal room-key pages and packets include direct directions for LH2 and LH3 guests, while LH1 and pending guests use the general Lake Monomonac area map until the LH1 address is confirmed.

Room-key QR codes:

- Each guest page links to a self-contained QR code image for that guest's room-key URL.
- QR route pattern: `/july2026/guest/{slug}/qr.svg`.
- Admin guest rows show each guest's QR code and can open tokenized QR URLs when a current token is available.
- Guest-specific SMS packets include the room-key QR code URL for screenshot or print-based sharing.

Printable room-key sheet:

- Admin includes a print-friendly room-key sheet at `/july2026/admin/room-keys`.
- The sheet lists every guest, current assignment, arrival, departure, companions, stable room-key URL, and room-key QR code.
- The sheet is intended for host check-in, arrival troubleshooting, and paper/screenshot backup.

Printable host briefing sheet:

- Admin includes a print-friendly host briefing sheet at `/july2026/admin/briefing-sheet`.
- The sheet summarizes the host text line, guest portal, launch caveats, arrival checklist, house flow, weekend schedule, meals, lake approvals, packing list, activities, motorized fleet, and common text prompts.
- The sheet is intended as a host operations backup for check-in, meal timing, lake rules, and day-of coordination.

Printable house signs:

- The guest portal exposes a generic event QR code at `/july2026/qr.svg`.
- Admin includes print-ready LH1, LH2, and LH3 house signs at `/july2026/admin/house-signs`.
- Each sign includes the house role, host text line, guest portal, address status, rooms/spaces, key moments at that house, and the portal QR code.
- The signs are intended for on-site guest orientation and resort-style arrival polish.

Personal calendar files:

- Each guest page links to a personal downloadable `.ics` file.
- Calendar route pattern: `/july2026/guest/{slug}/calendar.ics`.
- The calendar includes the guest's assignment or pending-assignment language, arrival/departure notes, personal room-key URL, personal packet URL, and host SMS line.

Missing-content request packet:

- Admin includes a copy-ready launch-completion request for the remaining host-supplied content.
- The same packet is downloadable at `/july2026/admin/missing-content.txt`.
- The packet lists LH1 address, LH1 interior/activity photos, LH2 bedroom photos, LH3 beach/room/detail photos, Zach and Bee assignments, and optional exact departure time.
- The packet includes review links for the guest portal, admin reference, and offline guide.

Launch QA links:

- Admin includes a compact review grid for the live guest portal, admin reference, offline guide, weekend calendar, host contact card, missing-content request, printable room-key sheet, printable host briefing sheet, house signs, sample assigned room key, and sample pending room key.
- The launch QA links are intended for fast host review before sending guest SMS packets.

## 12. Design Direction

Style should feel:

- Polished
- Playful
- Premium
- Lake resort inspired
- Family-friendly
- Clear and easy to use on mobile

Possible design language:

- “Welcome to the Lake Weekend Resort”
- “Your stay”
- “Your itinerary”
- “Resort map”
- “Guest check-in”
- “House profiles”
- “Lake activities”
- “Fourth of July experiences”

Avoid making the site feel too corporate or too silly. It should be fun but still useful.

## 13. Content and Asset Needs

Images still needed:

- LH1 exterior: provided as LH1 aerial photo
- LH1 sunroom
- LH1 Great Room 1
- LH1 Grand Peninsula
- LH1 South Grand Peninsula fire pit
- LH1 bedrooms
- LH2 exterior
- LH2 bedrooms
- LH3 exterior: provided as LH3 exterior patio photo
- LH3 beach
- LH3 primary bedroom
- LH3 dining/gathering areas
- Any room photos for personalized room pages

Current bundled media:

- Generated July 4th lake weekend hero artwork
- LH1 aerial exterior photo
- LH2 exterior front photo
- LH2 exterior side photo
- LH2 kitchen photo
- LH2 living room photo
- LH3 exterior patio photo
- LH3 animated profile video
- Motorized vehicle reference images for Laconic, Spikey Lizard, and Laika

Missing information:

- LH1 address
- Zach room assignment
- Bee room assignment
- Exact departure/check-out time, if needed
