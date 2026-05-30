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
- Host contact/help button
- Ability to view other guest assignments if desired

### Identity Binding Behavior

Current self-contained implementation: the first guest link opened on a device binds that guest identity to local browser storage.

If a different guest link is opened later on the same device, it does not overwrite the original device/session binding. The page shows the viewed guest details while making clear that the device remains checked in as the originally bound guest.

The current implementation is local-device binding only. Full cross-device enforcement would require a backend binding store.

The admin page includes a local reset control for the current device and a fresh token-style link generator for each guest.

### Admin Page

The admin page should show:

- List of all guests
- Each guest’s assigned house and room
- Whether the current browser has a completed first-device binding
- Ability to generate or regenerate a guest link with a fresh token-style query string
- Ability to reset the current device binding if needed

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

Each guest has a direct room-key URL. The admin page can also generate a fresh token-style URL by appending `?t=...`.

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

Opening one of these links on a device records the first guest identity locally. Opening a different guest link afterward does not replace that stored check-in unless the local device binding is reset.

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

The site should include an activities page or section with descriptions for:

- Yoga on the beach
- Kayaks
- Canoes
- Rowboats
- Swimming
- Motorized lake vehicles
- Boat ride
- Chartered fireworks cruise
- Famous Land hiking
- Famous Land quests
- Quad/four-wheeler by request or reservation
- Beach lounging
- Napping and downtime
- Campfire
- S’mores
- Sparklers
- Fireworks viewing

## 8. Motorized Vehicle Inventory

| Name | Vehicle | Color | Capacity | Reference image |
|---|---|---|---|---|
| Laconic | Sea-Doo Switch pontoon boat | Red | 10 persons | Red Sea-Doo Switch / Cruise-style pontoon |
| Spikey Lizard | Sea-Doo GTX PWC | Blue | 3 seats | Blue Sea-Doo GTX |
| Laika | Sea-Doo Spark Trixx | Red | 2 seats | Red Sea-Doo Trixx |

## 9. Guest Experience Requirements

The site should feel like a fun resort portal.

Suggested sections:

- Welcome / Check-In
- My Stay
- My Room
- Weekend Itinerary
- Houses
- Activities
- Food and Drinks
- Maps and Directions
- Help / Contact Host
- View Other Guests
- Admin

## 10. Design Direction

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

## 11. Content and Asset Needs

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

Missing information:

- LH1 address
- Zach room assignment
- Bee room assignment
- Exact departure/check-out time, if needed
- Any dietary notes or restrictions
- Whether boat/fireworks cruise or activity sign-ups need host approval
- Whether the quad requires specific safety restrictions or host approval
