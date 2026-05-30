const guideText = `FAMOUS.LAND JULY 4TH, 2026 WEEKEND GUIDE

Event portal:
https://famous.land/july2026

Arrival card:
https://famous.land/july2026/arrival-card

Directions hub:
https://famous.land/july2026/directions

Guest concierge:
https://famous.land/july2026/concierge

Host text line:
781-929-4932

Save host contact:
https://famous.land/july2026/host-contact.vcf

Add calendar:
https://famous.land/july2026/calendar.ics

WEEKEND OVERVIEW
Friday, July 3 through Sunday, July 5, 2026
Lake Monomonac weekend houses in Rindge, NH and Winchendon, MA
Sponsored by famous.land

ARRIVAL
Friday 3:00-6:00 PM
Arrive, settle into your assigned lake house, and find your room.
Use your personalized room-key link for your house, room, companions, and host help.
Each room-key page also includes a personal downloadable room-key packet.
Each room-key page also includes a personal calendar file with assignment and host-contact notes.

GETTING AROUND
- Friday starts at LH1 for the welcome meal, weekend orientation, and first-night fire gathering.
- Saturday morning shifts to LH3 for yoga, beach time, non-motorized boats, smoothies, lunch, dinner, and Sunday brunch.
- The Saturday group boat ride departs from LH1 after motorized fleet orientation and returns to LH3 for lunch.
- LH2 and LH3 directions are live in the guest portal. LH1 directions will be added when confirmed by the host.
- Use the directions hub for known house map links and the Lake Monomonac fallback map.

HOUSE DIRECTORY
LH1
Welcome, orientation, boat departure, fire pit.
Address: TBD.

LH2
Quiet guest rooms and coffee stop.
Address: 63 Pine Eden Road, Rindge, New Hampshire.

LH3
Beach, meals, brunch, boat return.
Address: 25 Sunny Cove Road, Winchendon, Massachusetts.

KEY SCHEDULE
Friday 3:00-6:00 PM - Guest check-in window
Friday 6:30 PM - Casual grab-and-go meal, Sunroom, LH1
Friday 7:00-8:00 PM - Weekend orientation, Great Room 1, LH1
Friday 8:00 PM - Campfire, cigars, and scotch, Grand Peninsula, LH1

Saturday 7:30-8:00 AM - Coffee time at all houses
Saturday 8:00 AM - Yoga on the beach, LH3
Saturday 9:00 AM - Non-motorized lake activities, LH3 / lake access
Saturday 10:00 AM - Fruit smoothies, LH3
Saturday 11:00 AM - Motorized lake vehicle orientation, LH1
Saturday 11:30 AM-12:30 PM - Boat ride, depart LH1 and return LH3
Saturday 12:30 PM - Lunch, LH3
Saturday 2:00-6:00 PM - Free time and optional activities
Saturday 6:00 PM - Dinner, LH3, lakeside patio seating
Saturday 8:00 PM - S'mores at the fire pit, South Grand Peninsula, LH1
Saturday 8:30 PM - Sparklers and snacks, South Grand Peninsula / LH1 area
Saturday 9:00 PM - Optional fireworks viewing from LH1, LH3, or host-approved cruise

Sunday 8:30 AM - Coffee time at all houses
Sunday 10:00 AM - Pancake brunch, LH3
After brunch - Free time and lake activities
Sunday afternoon - Departure and grab-and-go food

WHAT TO BRING
- Sunscreen
- Swimsuit and towel
- Reusable water bottle
- Bug spray
- Light jacket or hoodie
- Patriotic spirit

ARRIVAL CHECKLIST
- Before you leave: open your room-key link, save the host contact, and add the weekend calendar while you still have an easy signal.
- When you arrive: go to your assigned house, settle into your room, then use the schedule for the Friday LH1 welcome flow.
- Friday night: LH1 sunroom at 6:30 PM for the grab-and-go meal, then Great Room 1 at 7:00 PM for weekend orientation.
- Saturday lake day: start at LH3 for yoga and lake time; wait for the 11:00 AM LH1 orientation before motorized fleet use.

HOST TEXT PROMPTS
- Room help: Hi, I need help with my July 4th weekend room assignment or arrival directions.
- Dietary note: Hi, I have a dietary note for the July 4th weekend:
- Fleet approval: Hi, I would like host approval or timing guidance for motorized lake fleet use.
- Link reset: Hi, my July 2026 room-key link needs a reset or fresh token.
- Use the guest concierge for tap-to-text prompts, lake rules, and host approval guidance.

MOTORIZED VEHICLE INVENTORY
- Laconic: red Sea-Doo Switch Cruise pontoon boat, 23 ft, 10 persons. Best for group cruises, boat parade viewing, relaxed lake runs, and the Saturday LH1-to-LH3 ride after host orientation.
- Spikey Lizard: blue Sea-Doo GTX-style PWC, 3 seats. Best for host-approved PWC rides after the Saturday safety briefing.
- Laika: red Sea-Doo Spark Trixx-style PWC, 2 seats. Best for compact host-approved PWC outings after orientation.

APPROVAL NOTES
- Motorized fleet use starts only after the Saturday LH1 safety briefing and host go-ahead.
- Wear the right-size life jacket for boating, PWC rides, and lake activities where the host asks for one.
- Text the host before changing cruise plans, taking out a motorized vehicle, or requesting quad/four-wheeler time.
- Text dietary notes, allergies, arrival timing, or room-key help to 781-929-4932.
`;

export function GET() {
  return new Response(guideText, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-disposition": 'attachment; filename="famous-land-july-2026-guide.txt"',
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
