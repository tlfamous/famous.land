export const hostPhoneDisplay = "781-929-4932";
export const hostSmsPhone = "+17819294932";
export const defaultHostTextMessage =
  "Hi, I need help with the July 4th weekend.";
export const hostSmsHref = `sms:${hostSmsPhone}?&body=${encodeURIComponent(defaultHostTextMessage)}`;

export const scheduleItems = [
  {
    time: "Fri 3-6 PM",
    title: "Guest check-in window",
    detail: "Arrive, settle into your assigned lake house, and find your room."
  },
  {
    time: "Fri 6:30 PM",
    title: "Casual grab-and-go meal",
    detail: "Location: Sunroom, LH1. A flexible first-night meal after check-in."
  },
  {
    time: "Fri 7-8 PM",
    title: "Weekend orientation",
    detail: "Location: Great Room 1, LH1. Overview of locations, schedule, activities, safety, and logistics."
  },
  {
    time: "Fri 8 PM",
    title: "Campfire, cigars, and scotch",
    detail: "Location: Grand Peninsula, LH1. Relaxed evening gathering for those who partake."
  },
  {
    time: "Sat 7:30-8 AM",
    title: "Coffee time at all houses",
    detail: "LH1: Kona coffee. LH2: K-cup coffee. LH3: drip coffee. Guests may visit any house."
  },
  {
    time: "Sat 8:00 AM",
    title: "Yoga on the beach",
    detail: "Location: Beach, LH3. Morning yoga by the lake."
  },
  {
    time: "Sat 9:00 AM",
    title: "Non-motorized lake activities",
    detail: "Location: LH3 / lake access. Kayaks, canoes, rowboats, and swimming."
  },
  {
    time: "Sat 10:00 AM",
    title: "Fruit smoothies",
    detail: "Location: LH3. Refreshing smoothies after morning lake activities."
  },
  {
    time: "Sat 11:00 AM",
    title: "Motorized lake vehicle orientation",
    detail: "Location: LH1. Safety briefing and orientation for boats or similar lake equipment."
  },
  {
    time: "Sat 11:30 AM-12:30 PM",
    title: "Boat ride",
    detail: "Departure: LH1. Return: LH3. Group boat ride across the lake."
  },
  {
    time: "Sat 12:30 PM",
    title: "Lunch",
    detail: "Location: LH3. Lunch begins immediately after the boat ride returns."
  },
  {
    time: "Sat 2-6 PM",
    title: "Free time and optional activities",
    detail: "Hiking, Famous Land quests, motorized or non-motorized boating, beach lounging, quad by request, or downtime."
  },
  {
    time: "Sat 2:00 PM",
    title: "Fourth of July boat parade",
    detail: "Guests may see the parade during afternoon free time. It may pass by LH3 around 3:00 PM."
  },
  {
    time: "Sat 6:00 PM",
    title: "Dinner",
    detail: "Location: LH3. Lakeside patio seating."
  },
  {
    time: "Sat 8:00 PM",
    title: "S'mores at the fire pit",
    detail: "Location: South Grand Peninsula, LH1. Evening fire pit gathering with s'mores."
  },
  {
    time: "Sat 8:30 PM",
    title: "Sparklers and snacks",
    detail: "Location: South Grand Peninsula / LH1 area unless otherwise specified."
  },
  {
    time: "Sat 9:00 PM",
    title: "Optional fireworks viewing",
    detail: "Viewing options: Grand Peninsula at LH1, beach at LH3, or chartered cruise experience."
  },
  {
    time: "Sun 8:30 AM",
    title: "Coffee time at all houses",
    detail: "Same coffee setup as Saturday: Kona at LH1, K-cups at LH2, drip coffee at LH3."
  },
  {
    time: "Sun 10:00 AM",
    title: "Pancake brunch",
    detail: "Location: LH3. Relaxed Sunday brunch."
  },
  {
    time: "After brunch",
    title: "Free time and lake activities",
    detail: "Continue enjoying the lake, lounging, hiking, boating, or relaxing."
  },
  {
    time: "Sun afternoon",
    title: "Departure and grab-and-go food",
    detail: "Grab-and-go food available for guests as they depart."
  }
];

export const bringItems = [
  "Sunscreen",
  "Swimsuit and towel",
  "Reusable water bottle",
  "Bug spray",
  "Light jacket or hoodie",
  "Patriotic spirit"
];

export const resortDeskItems = [
  {
    action: "Open your room-key link",
    detail: "Use your personalized guest link for house, room, arrival, departure, companions, and host help.",
    label: "Check-in"
  },
  {
    action: "Review the house directory",
    detail: "Open the standalone LH1, LH2, and LH3 guide for rooms, assigned guests, house roles, maps, and weekend flow.",
    label: "Houses"
  },
  {
    action: "Text the host",
    detail: "Questions, dietary notes, link resets, quad requests, and motorized lake plans all go to 781-929-4932.",
    label: "Help"
  },
  {
    action: "Save the host contact",
    detail: "Add the famous.land host card to your phone so the weekend text line is easy to find.",
    label: "Contact"
  },
  {
    action: "Use the directions hub",
    detail: "LH2 and LH3 have live directions. LH1 directions will appear after the address is confirmed.",
    label: "Directions"
  },
  {
    action: "Open the resort map",
    detail: "See the weekend house flow across LH1, LH2, LH3, lake routes, meals, and gathering hubs.",
    label: "Map"
  },
  {
    action: "Add the weekend calendar",
    detail: "Download the famous.land calendar file for check-in, meals, yoga, boat ride, fireworks, brunch, and departure weekend.",
    label: "Calendar"
  },
  {
    action: "Open the meals guide",
    detail: "Welcome food, house coffee, smoothies, LH3 lunch, lakeside patio dinner, brunch, and dietary-note texting are in one place.",
    label: "Meals"
  },
  {
    action: "Save the offline guide",
    detail: "Download the plain-text weekend guide with schedule, house flow, host line, what to bring, and approval notes.",
    label: "Guide"
  },
  {
    action: "Wait for the Saturday orientation",
    detail: "Pontoon, PWC, and quad/four-wheeler use needs the host go-ahead before anyone heads out.",
    label: "Approvals"
  },
  {
    action: "Open the safety guide",
    detail: "Emergency-first guidance, life jackets, dock plan, host approvals, and Saturday lake orientation live in one place.",
    label: "Safety"
  }
];

export const arrivalChecklistItems = [
  {
    label: "Before you leave",
    detail: "Open your room-key link, save the host contact, and add the weekend calendar while you still have an easy signal."
  },
  {
    label: "When you arrive",
    detail: "Go to your assigned house, settle into your room, then use the schedule for the Friday LH1 welcome flow."
  },
  {
    label: "Friday night",
    detail: "Head to the LH1 sunroom for the 6:30 PM grab-and-go meal, then Great Room 1 for the 7:00 PM weekend orientation."
  },
  {
    label: "Saturday lake day",
    detail: "Start at LH3 for yoga and lake time; wait for the 11:00 AM LH1 orientation before any motorized fleet use."
  }
];

export const hostTextTemplates = [
  {
    label: "Room help",
    body: "Hi, I need help with my July 4th weekend room assignment or arrival directions."
  },
  {
    label: "Dietary note",
    body: "Hi, I have a dietary note for the July 4th weekend:"
  },
  {
    label: "Fleet approval",
    body: "Hi, I would like host approval or timing guidance for motorized lake fleet use."
  },
  {
    label: "Link reset",
    body: "Hi, my July 2026 room-key link needs a reset or fresh token."
  }
];

export const hostBroadcastMessages = [
  {
    audience: "All guests",
    label: "Arrival reminder",
    timing: "Friday morning",
    body:
      "Welcome to the famous.land July 4th weekend. Please open your room key before you leave, save the host contact, and text 781-929-4932 if you need arrival help. Check-in is Friday, July 3, 3-6 PM."
  },
  {
    audience: "All guests",
    label: "Friday welcome flow",
    timing: "Friday 5:30 PM",
    body:
      "Friday welcome flow: grab-and-go meal is at 6:30 PM in the LH1 sunroom, then weekend orientation is 7-8 PM in Great Room 1 at LH1. Text 781-929-4932 if you need directions or help."
  },
  {
    audience: "All guests",
    label: "Saturday lake morning",
    timing: "Saturday 7:30 AM",
    body:
      "Good morning. Coffee is available at all houses from 7:30-8 AM. Yoga is 8 AM at the LH3 beach, followed by non-motorized lake time and fruit smoothies at LH3."
  },
  {
    audience: "Motorized fleet guests",
    label: "Fleet orientation",
    timing: "Saturday 10:30 AM",
    body:
      "Motorized lake fleet reminder: orientation is 11 AM at LH1. Please wait for the host briefing and go-ahead before using Laconic, Spikey Lizard, Laika, or any other motorized equipment."
  },
  {
    audience: "All guests",
    label: "Boat ride movement",
    timing: "Saturday 11:15 AM",
    body:
      "Boat ride is 11:30 AM-12:30 PM, departing from LH1 and returning to LH3 for lunch. Please follow host direction for the dock plan and life jackets."
  },
  {
    audience: "All guests",
    label: "Dinner and fireworks",
    timing: "Saturday 5:30 PM",
    body:
      "Dinner is 6 PM at LH3 with lakeside patio seating. S'mores start around 8 PM at South Grand Peninsula, LH1, with fireworks viewing around 9 PM from LH1, LH3, or a host-approved cruise."
  },
  {
    audience: "All guests",
    label: "Sunday brunch",
    timing: "Sunday 9:00 AM",
    body:
      "Sunday coffee starts at 8:30 AM at all houses. Pancake brunch is 10 AM at LH3, followed by free time, lake activities, and Sunday afternoon departures."
  },
  {
    audience: "Guests needing help",
    label: "Host help",
    timing: "Anytime",
    body:
      "Text 781-929-4932 for room help, dietary notes, arrival directions, motorized fleet approval, cruise questions, or room-key link resets."
  }
] as const;

export const itineraryHighlights = {
  LH1: [
    {
      detail: "Settle in, then stay close for the welcome meal and orientation.",
      time: "Fri 3-8 PM",
      title: "Arrival hub"
    },
    {
      detail: "Group boat ride departs from LH1 and returns to LH3 for lunch.",
      time: "Sat 11:00 AM",
      title: "Boat orientation and departure"
    },
    {
      detail: "S'mores, sparklers, snacks, and Grand Peninsula fireworks viewing happen around LH1.",
      time: "Sat evening",
      title: "Fire pit and fireworks"
    }
  ],
  LH2: [
    {
      detail: "Quiet guest-room house with K-cup coffee before the lake day starts.",
      time: "Sat 7:30 AM",
      title: "Coffee stop"
    },
    {
      detail: "Head to LH3 for yoga, lake activities, smoothies, lunch, dinner, and brunch.",
      time: "Sat-Sun",
      title: "Meals and beach time"
    },
    {
      detail: "Use the live LH2 directions link for the house, then follow the schedule for LH1 and LH3 gatherings.",
      time: "All weekend",
      title: "House-to-house flow"
    }
  ],
  LH3: [
    {
      detail: "Yoga, swimming, non-motorized boats, smoothies, lunch, dinner, and Sunday brunch are centered at LH3.",
      time: "Sat-Sun",
      title: "Beach and meals hub"
    },
    {
      detail: "The Saturday boat ride returns to LH3 right before lunch.",
      time: "Sat 12:30 PM",
      title: "Boat return"
    },
    {
      detail: "Watch fireworks from LH3 beach or coordinate the optional cruise with the host.",
      time: "Sat 9:00 PM",
      title: "Fireworks option"
    }
  ],
  Pending: [
    {
      detail: "Text the host before arrival for the latest lodging details.",
      time: "Before Fri",
      title: "Confirm your room"
    },
    {
      detail: "The weekend schedule is still available while your room placement is finalized.",
      time: "Fri-Sun",
      title: "Follow the full itinerary"
    },
    {
      detail: "Use the host text line for room assignment, directions, and arrival questions.",
      time: "Anytime",
      title: "Host help"
    }
  ]
} as const;

export const activityItems = [
  {
    title: "Beach and swimming",
    location: "LH3",
    detail: "Beach time, swimming, lounging, and the easiest lake access for Saturday and Sunday."
  },
  {
    title: "Kayaks, canoes, and rowboats",
    location: "LH3 / lake access",
    detail: "Non-motorized lake time starts Saturday morning and stays available during free time."
  },
  {
    title: "Motorized lake fleet",
    location: "LH1 orientation",
    detail: "Use begins after the Saturday safety briefing and follows host direction."
  },
  {
    title: "Famous Land quests and hiking",
    location: "Famous Land",
    detail: "Optional dry-land exploring during the Saturday afternoon free-time block."
  },
  {
    title: "Campfire, s'mores, and fireworks",
    location: "LH1 / LH3",
    detail: "Evening fire pit at LH1, with fireworks viewing from LH1, LH3, or the optional cruise."
  }
];

export const foodMoments = [
  {
    time: "Fri 6:30 PM",
    title: "Grab-and-go welcome meal",
    detail: "Sunroom, LH1. Casual first-night food after check-in."
  },
  {
    time: "Sat 7:30 AM",
    title: "Coffee at all houses",
    detail: "Kona at LH1, K-cups at LH2, and drip coffee at LH3."
  },
  {
    time: "Sat 10:00 AM",
    title: "Fruit smoothies",
    detail: "LH3 after morning lake activities."
  },
  {
    time: "Sat 12:30 PM",
    title: "Lunch",
    detail: "LH3, immediately after the boat ride returns."
  },
  {
    time: "Sat 6:00 PM",
    title: "Dinner",
    detail: "LH3 with lakeside patio seating."
  },
  {
    time: "Sun 10:00 AM",
    title: "Pancake brunch",
    detail: "LH3 before Sunday free time and departures."
  }
];

export const hostHelpItems = [
  {
    title: "Dietary notes",
    detail: "Text the host with allergies, dietary restrictions, or anything the kitchen should know before the weekend."
  },
  {
    title: "Motorized fleet approval",
    detail: "Sea-Doo, pontoon, and other motorized lake use require the Saturday orientation and host go-ahead."
  },
  {
    title: "Quad and cruise requests",
    detail: "Quad/four-wheeler use and optional fireworks cruise plans are by host approval."
  },
  {
    title: "Room-key help",
    detail: "If a guest link says it needs a host reset, text the host for a fresh room-key link."
  }
];

export const lakeUseRules = [
  {
    label: "Orientation first",
    detail: "Motorized fleet use starts only after the Saturday LH1 safety briefing and a host go-ahead."
  },
  {
    label: "Life jackets",
    detail: "Wear the right-size life jacket for boating, PWC rides, and any lake activity where the host asks for one."
  },
  {
    label: "Dock plan",
    detail: "Use the host-designated departure and return points, especially for the LH1-to-LH3 group boat ride."
  },
  {
    label: "Text before changes",
    detail: "Text the host before changing cruise plans, taking out a motorized vehicle, or requesting quad/four-wheeler time."
  }
];

export const transitGuideItems = [
  {
    label: "Arrive at your assigned house",
    detail: "Use your room-key page for the best known directions. LH2 and LH3 are live; LH1 directions will be added when the host confirms the address."
  },
  {
    label: "Friday starts at LH1",
    detail: "Welcome meal, weekend orientation, and the first-night fire gathering are based at LH1."
  },
  {
    label: "Saturday morning shifts to LH3",
    detail: "Yoga, beach time, non-motorized boats, smoothies, lunch, dinner, and Sunday brunch are centered at LH3."
  },
  {
    label: "Boat ride connects LH1 to LH3",
    detail: "The Saturday group ride departs from LH1 after motorized fleet orientation and returns to LH3 for lunch."
  }
];

export const motorizedVehicles = [
  {
    approval: "Host orientation required before use",
    bestFor: "Group cruise, boat parade viewing, and relaxed lake runs",
    capacity: "10 persons",
    color: "Red",
    detail: "Primary group pontoon for lake runs, boat parade viewing, and the Saturday LH1-to-LH3 ride after host orientation.",
    image: "laconic",
    length: "23 ft",
    model: "23 ft Switch Cruise pontoon reference",
    name: "Laconic",
    pickup: "LH1 dock / host-designated departure point",
    source: "Red Sea-Doo Switch Cruise studio reference",
    sourceUrl:
      "https://sea-doo.brp.com/content/dam/global/en/sea-doo/my23/studio/switch/cruise/SEA-MY23-Can-Am-SWIC-230hp-21-Coral-Blast-00046PT00-34FR-NA.png",
    type: "Sea-Doo Switch Cruise pontoon boat"
  },
  {
    approval: "Host orientation and PWC go-ahead required",
    bestFor: "Three-seat PWC rides after the safety briefing",
    capacity: "3 seats",
    color: "Blue",
    detail: "Personal watercraft for approved lake use after the Saturday safety briefing.",
    image: "spikey-lizard",
    length: "PWC",
    model: "GTX-style 3-seat PWC reference",
    name: "Spikey Lizard",
    pickup: "Host-approved lake launch point",
    source: "Blue Sea-Doo GTX studio reference",
    sourceUrl:
      "https://sea-doo.brp.com/content/dam/global/en/sea-doo/my26/studio/touring/gtx/SEA-MY26-GTX-Standard-NoSS-M170-Blue-Abyss-Gulfstream-Blue-00011TD00-Studio-34FR-CU.png",
    type: "Sea-Doo GTX-style PWC"
  },
  {
    approval: "Host orientation and PWC go-ahead required",
    bestFor: "Compact two-seat Trixx-style PWC outings",
    capacity: "2 seats",
    color: "Red",
    detail: "Compact Trixx-style PWC for host-approved lake use after orientation.",
    image: "laika",
    length: "PWC",
    model: "Spark Trixx 2up-style PWC reference",
    name: "Laika",
    pickup: "Host-approved lake launch point",
    source: "Red Sea-Doo Spark Trixx 2up studio reference",
    sourceUrl:
      "https://sea-doo.brp.com/content/dam/global/en/sea-doo/my22/studio/rec-lite/SEA-MY22-SPARK-2up-IBR-TRIXX-withoutSS-90-Can-Am-Red-SKU00065NA00-Studio-34FR-NA-661x480.png",
    type: "Sea-Doo Spark Trixx-style PWC"
  }
];

export const launchCompletionItems = [
  {
    detail: "Needed before LH1 directions can be shown.",
    label: "LH1 address",
    status: "Needed"
  },
  {
    detail: "Sunroom, Great Room 1, Grand Peninsula, South Grand Peninsula fire pit, and assigned rooms.",
    label: "LH1 interior and activity photos",
    status: "Needed"
  },
  {
    detail: "South bedroom and North bedroom photos for room-level confidence.",
    label: "LH2 bedroom photos",
    status: "Needed"
  },
  {
    detail: "Beach, primary bedroom, dining/gathering, smoothie, lunch, dinner, and brunch areas.",
    label: "LH3 beach and room photos",
    status: "Needed"
  },
  {
    detail: "Host-confirmed room placement for both guests.",
    label: "Zach and Bee assignments",
    status: "Needed"
  },
  {
    detail: "Guest pages currently say Sunday afternoon.",
    label: "Exact departure time",
    status: "Optional"
  }
] as const;

export function getLaunchCompletionRequestText(baseUrl = "https://famous.land") {
  return [
    "July 4th, 2026 famous.land launch completion request",
    "",
    "Please send or confirm these remaining items so the guest portal can be final:",
    "",
    ...launchCompletionItems.map((item, index) => `${index + 1}. ${item.label} (${item.status})\n   ${item.detail}`),
    "",
    "Current review links:",
    `Guest portal: ${baseUrl}/july2026`,
    `Resort pass: ${baseUrl}/july2026/pass`,
    `Arrival card: ${baseUrl}/july2026/arrival-card`,
    `Resort map: ${baseUrl}/july2026/map`,
    `Directions hub: ${baseUrl}/july2026/directions`,
    `House directory: ${baseUrl}/july2026/houses`,
    `Guest concierge: ${baseUrl}/july2026/concierge`,
    `Packing prep: ${baseUrl}/july2026/prep`,
    `Weekend itinerary: ${baseUrl}/july2026/itinerary`,
    `Meals and coffee: ${baseUrl}/july2026/meals`,
    `Fleet guide: ${baseUrl}/july2026/fleet`,
    `Safety guide: ${baseUrl}/july2026/safety`,
    `Admin reference: ${baseUrl}/july2026/admin`,
    `Launch status: ${baseUrl}/july2026/admin/status.txt`,
    `Guest SMS packets: ${baseUrl}/july2026/admin/sms-packets`,
    `Host text templates: ${baseUrl}/july2026/admin/host-texts`,
    `Media shot list: ${baseUrl}/july2026/admin/media-shot-list`,
    `Offline guide: ${baseUrl}/july2026/weekend-guide.txt`,
    `Download this request: ${baseUrl}/july2026/admin/missing-content.txt`,
    "",
    "Once these are confirmed, the site can replace pending room/address language and add the remaining room/detail media."
  ].join("\n");
}

export function getLaunchStatusText(baseUrl = "https://famous.land") {
  const assignedGuests = guestAssignments.filter((guest) => guest.house !== "Pending");
  const pendingGuests = guestAssignments.filter((guest) => guest.house === "Pending");

  return [
    "July 4th, 2026 famous.land launch status",
    "",
    "Overall status: Guest portal is published and usable with known pending host-confirmation items.",
    "",
    "Published guest surfaces:",
    `- Guest portal: ${baseUrl}/july2026`,
    `- Admin reference: ${baseUrl}/july2026/admin`,
    `- Resort pass: ${baseUrl}/july2026/pass`,
    `- Arrival card: ${baseUrl}/july2026/arrival-card`,
    `- Resort map: ${baseUrl}/july2026/map`,
    `- Directions hub: ${baseUrl}/july2026/directions`,
    `- House directory: ${baseUrl}/july2026/houses`,
    `- Guest concierge: ${baseUrl}/july2026/concierge`,
    `- Packing prep: ${baseUrl}/july2026/prep`,
    `- Weekend itinerary: ${baseUrl}/july2026/itinerary`,
    `- Meals and coffee: ${baseUrl}/july2026/meals`,
    `- Fleet guide: ${baseUrl}/july2026/fleet`,
    `- Safety guide: ${baseUrl}/july2026/safety`,
    `- Offline weekend guide: ${baseUrl}/july2026/weekend-guide.txt`,
    `- Weekend calendar: ${baseUrl}/july2026/calendar.ics`,
    `- Host contact card: ${baseUrl}/july2026/host-contact.vcf`,
    "",
    "Admin review surfaces:",
    `- Launch status: ${baseUrl}/july2026/admin/status.txt`,
    `- Missing-content request: ${baseUrl}/july2026/admin/missing-content.txt`,
    `- Guest SMS packets: ${baseUrl}/july2026/admin/sms-packets`,
    `- Host text templates: ${baseUrl}/july2026/admin/host-texts`,
    `- Media shot list: ${baseUrl}/july2026/admin/media-shot-list`,
    `- Printable room keys: ${baseUrl}/july2026/admin/room-keys`,
    `- Host briefing sheet: ${baseUrl}/july2026/admin/briefing-sheet`,
    `- House signs: ${baseUrl}/july2026/admin/house-signs`,
    "",
    "Ready now:",
    "- Resort-style guest portal and supporting pages",
    "- Mobile resort pass with QR, host text, calendar, offline guide, and key itinerary actions",
    "- Prefilled Contact Host SMS actions to 781-929-4932",
    "- Downloadable host contact card",
    "- Shared weekend calendar and personal guest calendars",
    "- Offline weekend guide and personal room-key packets",
    "- Guest-specific SMS packet review",
    "- Printable room-key sheet, host briefing sheet, and house signs",
    "- LH2 and LH3 live directions",
    "- Motorized fleet inventory for Laconic, Spikey Lizard, and Laika",
    "",
    "Guest assignment status:",
    `- Assigned guests: ${assignedGuests.length} of ${guestAssignments.length}`,
    `- Pending guests: ${pendingGuests.length} of ${guestAssignments.length}`,
    ...pendingGuests.map((guest) => `  - ${guest.name}: assignment pending host confirmation`),
    "",
    "Still needed from host:",
    ...launchCompletionItems.map((item) => `- ${item.label} (${item.status}): ${item.detail}`),
    "",
    "Current caveats shown to guests:",
    "- LH1 directions stay pending until the address is confirmed.",
    "- Zach and Bee pages show assignment-pending language instead of a false room.",
    "- Guest pages say Sunday afternoon for departure until a precise time is confirmed.",
    "- Remaining bedroom, beach, meal-area, and activity-location photos are tracked in the media shot list.",
    "",
    "Next host action:",
    `Send the missing-content request: ${baseUrl}/july2026/admin/missing-content.txt`
  ].join("\n");
}

export type GuestAssignment = {
  slug: string;
  name: string;
  house: "LH1" | "LH2" | "LH3" | "Pending";
  room: string;
  companions: string[];
  arrival: string;
  departure: string;
  note: string;
};

export const guestAssignments: GuestAssignment[] = [
  {
    slug: "holly",
    name: "Holly",
    house: "LH3",
    room: "Primary bedroom",
    companions: ["Todd"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "Meals, beach time, brunch, and the boat return are centered at LH3."
  },
  {
    slug: "todd",
    name: "Todd",
    house: "LH3",
    room: "Primary bedroom",
    companions: ["Holly"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "Meals, beach time, brunch, and the boat return are centered at LH3."
  },
  {
    slug: "heather",
    name: "Heather",
    house: "LH1",
    room: "Second floor bedroom",
    companions: ["Eric"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "Welcome meal, orientation, boat departure, and evening fire pit are based at LH1."
  },
  {
    slug: "eric",
    name: "Eric",
    house: "LH1",
    room: "Second floor bedroom",
    companions: ["Heather"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "Welcome meal, orientation, boat departure, and evening fire pit are based at LH1."
  },
  {
    slug: "zach",
    name: "Zach",
    house: "Pending",
    room: "Assignment pending",
    companions: [],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "This guest is listed in the reference material, but the room assignment still needs host confirmation."
  },
  {
    slug: "bee",
    name: "Bee",
    house: "Pending",
    room: "Assignment pending",
    companions: [],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "This guest is listed in the reference material, but the room assignment still needs host confirmation."
  },
  {
    slug: "cin",
    name: "Cin",
    house: "LH2",
    room: "South bedroom",
    companions: ["Vin"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "LH2 is the quiet guest-room house and K-cup coffee stop."
  },
  {
    slug: "vin",
    name: "Vin",
    house: "LH2",
    room: "South bedroom",
    companions: ["Cin"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "LH2 is the quiet guest-room house and K-cup coffee stop."
  },
  {
    slug: "adam",
    name: "Adam",
    house: "LH2",
    room: "North bedroom",
    companions: ["Gage"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "LH2 is the quiet guest-room house and K-cup coffee stop."
  },
  {
    slug: "gage",
    name: "Gage",
    house: "LH2",
    room: "North bedroom",
    companions: ["Adam"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "LH2 is the quiet guest-room house and K-cup coffee stop."
  },
  {
    slug: "morgan",
    name: "Morgan",
    house: "LH1",
    room: "The Girls' Room",
    companions: ["Rowan", "Emma", "Austin"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "The Girls' Room is the third floor bedroom at LH1."
  },
  {
    slug: "rowan",
    name: "Rowan",
    house: "LH1",
    room: "The Girls' Room",
    companions: ["Morgan", "Emma", "Austin"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "The Girls' Room is the third floor bedroom at LH1."
  },
  {
    slug: "emma",
    name: "Emma",
    house: "LH1",
    room: "The Girls' Room",
    companions: ["Morgan", "Rowan", "Austin"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "The Girls' Room is the third floor bedroom at LH1."
  },
  {
    slug: "austin",
    name: "Austin",
    house: "LH1",
    room: "The Girls' Room",
    companions: ["Morgan", "Rowan", "Emma"],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "The Girls' Room is the third floor bedroom at LH1."
  },
  {
    slug: "jack",
    name: "Jack",
    house: "LH1",
    room: "Sunroom",
    companions: [],
    arrival: "Friday, July 3, 3-6 PM",
    departure: "Sunday afternoon",
    note: "The Friday grab-and-go meal is also in the LH1 sunroom."
  }
];

export const statusItems = [
  { label: "Weekend", value: "Jul 3-5" },
  { label: "Check-in", value: "Fri 3 PM" },
  { label: "Calendar", value: "Ready" },
  { label: "Host", value: "Text-ready" },
  { label: "Lake", value: "Resort mode" }
];

export const houseProfiles = [
  {
    name: "LH1",
    role: "Welcome, orientation, boat departure, fire pit",
    rooms: ["Second floor bedroom", "The Girls' Room", "Sunroom"],
    note: "Address TBD",
    mapLabel: "Directions pending",
    image: "lake-house-1"
  },
  {
    name: "LH2",
    role: "Quiet guest rooms and coffee stop",
    rooms: ["South bedroom", "North bedroom"],
    note: "63 Pine Eden Road, Rindge, New Hampshire",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=63%20Pine%20Eden%20Road%2C%20Rindge%2C%20NH",
    mapLabel: "Open LH2 directions",
    image: "lake-house-2"
  },
  {
    name: "LH3",
    role: "Beach, meals, brunch, boat return",
    rooms: ["Primary bedroom"],
    note: "25 Sunny Cove Road, Winchendon, Massachusetts",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=25%20Sunny%20Cove%20Road%2C%20Winchendon%2C%20MA",
    mapLabel: "Open LH3 directions",
    image: "lake-house-3"
  }
];

export function getGuestPacketText(guest: GuestAssignment, baseUrl = "https://famous.land") {
  const assignment =
    guest.house === "Pending"
      ? "Assignment pending: text the host before arrival for the latest lodging details."
      : `${guest.house} / ${guest.room}`;
  const companionText = guest.companions.length ? guest.companions.join(", ") : "Solo room assignment";
  const house =
    guest.house === "Pending" ? null : houseProfiles.find((profile) => profile.name === guest.house);
  const directionsUrl =
    house && "mapsUrl" in house && house.mapsUrl
      ? house.mapsUrl
      : "https://www.google.com/maps/search/?api=1&query=Lake%20Monomonac%20Rindge%20NH%20Winchendon%20MA";
  const highlights = itineraryHighlights[guest.house].map(
    (item) => `- ${item.time}: ${item.title}. ${item.detail}`
  );

  return `FAMOUS.LAND JULY 4TH, 2026 ROOM KEY

Guest:
${guest.name}

Assignment:
${assignment}

Staying with:
${companionText}

Arrival:
${guest.arrival}

Departure:
${guest.departure}

House note:
${guest.house === "Pending" ? guest.note : house?.role ?? guest.note}

Personal highlights:
${highlights.join("\n")}

Weekend essentials:
- Friday 3:00-6:00 PM: guest check-in window.
- Friday 6:30 PM: grab-and-go welcome meal, Sunroom, LH1.
- Friday 7:00 PM: weekend orientation, Great Room 1, LH1.
- Saturday 8:00 AM: yoga on the beach, LH3.
- Saturday 11:00 AM: motorized lake vehicle orientation, LH1.
- Saturday 11:30 AM: boat ride, depart LH1 and return LH3.
- Saturday 6:00 PM: dinner, LH3, lakeside patio seating.
- Saturday 9:00 PM: fireworks viewing from LH1, LH3, or host-approved cruise.
- Sunday 10:00 AM: pancake brunch, LH3.

Links:
Room key: ${baseUrl}/july2026/guest/${guest.slug}
Room-key QR code: ${baseUrl}/july2026/guest/${guest.slug}/qr.svg
Directions: ${directionsUrl}
Guest portal: ${baseUrl}/july2026
Resort pass: ${baseUrl}/july2026/pass
Arrival card: ${baseUrl}/july2026/arrival-card
Resort map: ${baseUrl}/july2026/map
Directions hub: ${baseUrl}/july2026/directions
Guest concierge: ${baseUrl}/july2026/concierge
Packing prep: ${baseUrl}/july2026/prep
Weekend itinerary: ${baseUrl}/july2026/itinerary
Meals and coffee: ${baseUrl}/july2026/meals
Fleet guide: ${baseUrl}/july2026/fleet
Safety guide: ${baseUrl}/july2026/safety
Calendar: ${baseUrl}/july2026/calendar.ics
Offline guide: ${baseUrl}/july2026/weekend-guide.txt
Save host contact: ${baseUrl}/july2026/host-contact.vcf

Host text line:
781-929-4932

Notes:
- Motorized fleet use starts only after the Saturday LH1 safety briefing and host go-ahead.
- Wear the right-size life jacket for boating, PWC rides, and lake activities where the host asks for one.
- Text the host for room help, dietary notes, fleet approval, or link resets.
`;
}

export function getGuestQrPath(guest: GuestAssignment, path?: string) {
  const queryIndex = path?.indexOf("?") ?? -1;
  return `/july2026/guest/${guest.slug}/qr.svg${queryIndex === -1 || !path ? "" : path.slice(queryIndex)}`;
}

export function getGuestSmsPacket(
  guest: GuestAssignment,
  path = `/july2026/guest/${guest.slug}`,
  baseUrl = "https://famous.land"
) {
  const qrPath = getGuestQrPath(guest, path);
  const assignment =
    guest.house === "Pending"
      ? "Your room assignment is still pending host confirmation."
      : `You are staying at ${guest.house}, ${guest.room}.`;

  return [
    `Hi ${guest.name}, here is your famous.land July 4th, 2026 room key:`,
    `${baseUrl}${path}`,
    "",
    assignment,
    `Arrival: ${guest.arrival}`,
    `Departure: ${guest.departure}`,
    "",
    `Personal room-key packet: ${baseUrl}/july2026/guest/${guest.slug}/packet.txt`,
    `Personal calendar: ${baseUrl}/july2026/guest/${guest.slug}/calendar.ics`,
    `Room-key QR code: ${baseUrl}${qrPath}`,
    `Resort pass: ${baseUrl}/july2026/pass`,
    `Calendar: ${baseUrl}/july2026/calendar.ics`,
    `Offline guide: ${baseUrl}/july2026/weekend-guide.txt`,
    `Save host contact: ${baseUrl}/july2026/host-contact.vcf`,
    "",
    "Text 781-929-4932 for room help, dietary notes, fleet approval, or link resets."
  ].join("\n");
}
