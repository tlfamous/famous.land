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
    action: "Text the host",
    detail: "Questions, dietary notes, link resets, quad requests, and motorized lake plans all go to 781-929-4932.",
    label: "Help"
  },
  {
    action: "Use the house directory",
    detail: "LH2 and LH3 have live directions. LH1 directions will appear after the address is confirmed.",
    label: "Directions"
  },
  {
    action: "Add the weekend calendar",
    detail: "Download the famous.land calendar file for check-in, meals, yoga, boat ride, fireworks, brunch, and departure weekend.",
    label: "Calendar"
  },
  {
    action: "Wait for the Saturday orientation",
    detail: "Pontoon, PWC, and quad/four-wheeler use needs the host go-ahead before anyone heads out.",
    label: "Approvals"
  }
];

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
    length: "Host reference: 23 ft",
    model: "Switch Cruise 21-class pontoon reference",
    name: "Laconic",
    pickup: "LH1 dock / host-designated departure point",
    source: "Red / Coral Blast Sea-Doo Switch Cruise 21 studio reference",
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
    model: "GTX-style PWC reference",
    name: "Spikey Lizard",
    pickup: "Host-approved lake launch point",
    source: "Blue Sea-Doo GTX studio reference",
    type: "Sea-Doo PWC"
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
    type: "Sea-Doo Spark Trixx"
  }
];

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
