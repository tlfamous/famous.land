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

### Admin Page

The admin page should show:

- List of all guests
- Each guest’s assigned house and room
- Whether the current browser has a completed first-device binding
- Persistent guest-link service status
- Ability to generate or regenerate a guest link with a fresh token-style query string
- Ability to reset a guest binding if needed
- Ability to copy one SMS-ready packet of all current room-key links
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
| Laconic | Sea-Doo Switch Cruise pontoon boat | Red | 10 persons | Group cruise, boat parade viewing, and relaxed lake runs | LH1 dock / host-designated departure point | Host orientation required before use | Red / Coral Blast Sea-Doo Switch Cruise 21-class studio reference; host reference says 23 ft | Primary group pontoon for lake runs, boat parade viewing, and the Saturday LH1-to-LH3 ride after host orientation. |
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
- My Stay
- My Room
- Weekend Itinerary
- Houses
- Activities
- Motorized Fleet
- Lake Rules and Approvals
- Food and Drinks
- Maps and Directions with known LH2 and LH3 address links
- Help / Contact Host
- View Other Guests
- Admin

Admin operating sections:

- Planning summary
- Reference checkpoints
- Launch readiness tracker
- Asset and content checklist showing live bundled media and missing host-supplied content
- Resort Desk readiness
- Guest-link packet readiness
- Personalized itinerary readiness
- Motorized vehicle inventory
- Lake rules readiness
- Personalized room-key URLs
- Embedded reference material with Proof edit link

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
