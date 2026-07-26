import type { GuideSection, Home, HomeLockDevice, LocalHomesStore } from "./types";

const SEED_TIMESTAMP = "2026-07-11T00:00:00.000Z";

export const SEEDED_HOMES: Home[] = [
  {
    id: "home_lh1",
    lhCode: "LH1",
    publicName: "Lake House 1",
    rentalState: "unconfigured",
    isPublic: false,
    timezone: "America/New_York",
    address: "26 Sunny Cove Road, Winchendon, Massachusetts",
    description: "The original lake house with the Grand Peninsula and lake access.",
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "home_lh2",
    lhCode: "LH2",
    publicName: "63 Pine Eden",
    slug: "63-pine-eden",
    rentalState: "unconfigured",
    isPublic: false,
    timezone: "America/New_York",
    address: "63 Pine Eden Road, Rindge, New Hampshire",
    description:
      "A quiet lake house with two-zone air conditioning, a fireplace, and Starlink Internet.",
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "home_lh3",
    lhCode: "LH3",
    publicName: "25 Sunny Cove",
    rentalState: "active",
    isPublic: false,
    timezone: "America/New_York",
    address: "25 Sunny Cove Road, Winchendon, Massachusetts",
    description:
      "Lake Monomonac cottage with a private beach, dock, patio, kayaks, rowboat, full kitchen, Wi-Fi, AC, and parking.",
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  }
];

const pineEdenSection = (
  id: string,
  sectionType: GuideSection["sectionType"],
  title: string,
  body: string,
  displayOrder: number,
  secretRef?: string
): GuideSection => ({
  id,
  homeId: "home_lh2",
  sectionType,
  title,
  body,
  displayOrder,
  secretRef,
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP
});

export const PINE_EDEN_GUIDE_SECTIONS: GuideSection[] = [
  pineEdenSection(
    "lh2_boundaries",
    "boundaries",
    "Property boundaries",
    "The property is bounded on either side by a line of large trees. Please do not go onto the neighboring property or docks; they are private property.",
    10
  ),
  pineEdenSection(
    "lh2_policies",
    "policies",
    "Smoking and pets",
    "No smoking. No pets.",
    20
  ),
  pineEdenSection(
    "lh2_help",
    "help",
    "Need help?",
    "Enjoy your stay. If you have any issues, please message the host through Airbnb.",
    30
  ),
  pineEdenSection(
    "lh2_wifi",
    "wifi",
    "Wi-Fi",
    "The current network name and password appear here and on the printed house sheet.",
    40,
    "wifi_credentials"
  ),
  pineEdenSection(
    "lh2_water",
    "water",
    "Water",
    "High quality water filter provided at the sink for drinking and cooking.",
    50
  ),
  pineEdenSection(
    "lh2_waste",
    "waste",
    "Trash and recycling",
    "Extra garbage goes in the bin on the front porch. Recycling goes in the blue basket under the oven.",
    60
  ),
  pineEdenSection(
    "lh2_food",
    "food",
    "Pantry",
    "Take or leave what you would like in the pantry and refrigerators.",
    70
  ),
  pineEdenSection(
    "lh2_bathroom",
    "bathroom",
    "Using the shower",
    "Adjust the temperature on the sink faucet, then pull down on the faucet spout to activate the shower.\n\nPost on the gram about the wacky plumbing in your AirBNB.",
    80
  ),
  pineEdenSection(
    "lh2_lake_safety",
    "lake_safety",
    "Boating",
    "Life preservers recommended for boating with Kayaks or canoe.",
    90
  ),
  pineEdenSection(
    "lh2_fire_pit",
    "fire_pit",
    "Fire pit",
    "Firewood is stored near the kayaks.",
    100
  ),
  pineEdenSection(
    "lh2_dining",
    "food",
    "Dining near 63 Pine Eden",
    "Approximate drive times from 63 Pine Eden in normal traffic. Confirm current hours before heading out.\n\n" +
      "- Emma's 321 Pub & Kitchen — about 3 min — burgers, fish and chips, and American comfort food\n" +
      "- Hometown Diner — about 4 min — classic diner breakfast and lunch\n" +
      "- Phoenix Smokehouse — about 7 min — barbecue and takeout near the Rindge Walmart\n" +
      "- The Grove at Woodbound Inn — about 9 min — brunch, lunch, and dinner in Rindge\n" +
      "- Dublin Road Taproom & Eatery — about 14 min — pub fare, comfort food, and rotating draft beers in Jaffrey",
    105
  ),
  pineEdenSection(
    "lh2_checkout_laundry",
    "checkout",
    "Checkout: towels",
    "Please place used towels in the bedroom laundry basket.",
    110
  ),
  pineEdenSection(
    "lh2_checkout_dishes",
    "checkout",
    "Checkout: dishes",
    "Please put dirty dishes in the dishwasher, add soap and press run.",
    120
  )
];

export const MONOMONAC_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "lh3_dining",
    homeId: "home_lh3",
    sectionType: "food",
    title: "Dining near Lake Monomonac",
    body:
      "Approximate drive times from 25 Sunny Cove in normal traffic. Confirm current hours before heading out.\n\n" +
      "- Hometown Diner — about 5 min — classic diner breakfast and lunch\n" +
      "- Emma's 321 Pub & Kitchen — about 15 min — burgers, fish and chips, and American comfort food\n" +
      "- Phoenix Smokehouse — about 15 min — barbecue and takeout near the Rindge Walmart\n" +
      "- Sippin' Serendipity — about 9 min — coffee, breakfast, and baked treats\n" +
      "- Koi Asian Cuisine & Lounge — about 10 min — Asian cuisine and takeout\n" +
      "- Little Anthony's Restaurant — about 12 min — seafood and American classics\n" +
      "- The Grove at Woodbound Inn — about 19 min — brunch, lunch, and dinner in Rindge",
    displayOrder: 130,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_boundaries",
    homeId: "home_lh3",
    sectionType: "boundaries",
    title: "The cottage and grounds",
    body:
      "25 Sunny Cove is a lakefront cottage on a peninsula on Lake Monomonac. The private beach, dock, patio, and grounds are for cottage guests.",
    displayOrder: 10,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_policies",
    homeId: "home_lh3",
    sectionType: "policies",
    title: "House basics",
    body:
      "The cottage accommodates up to three guests: one queen bed and one small pull-out couch. Check-in is after 3:00 PM and checkout is before 11:00 AM. Airbnb provides stay-specific entry details.",
    displayOrder: 20,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_help",
    homeId: "home_lh3",
    sectionType: "help",
    title: "Need help?",
    body: "If you have any issues, please message the host through Airbnb.",
    displayOrder: 30,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_lock",
    homeId: "home_lh3",
    sectionType: "help",
    title: "Opening the lock",
    body:
      "Use the stay-specific code provided by Airbnb.\n\nTo unlock:\n1. Touch the screen with your palm or the back of your hand to activate it.\n2. Enter the code, then tap the check icon.\n3. The lock will play a happy sound and unlock.\n\nTo lock:\n1. Close the door.\n2. Pull up on the handle to pull the door tight.\n3. Touch the screen with your palm or the back of your hand.\n4. The lock will play a happy sound and lock.",
    displayOrder: 35,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_wifi",
    homeId: "home_lh3",
    sectionType: "wifi",
    title: "Wi-Fi",
    body: "The current network name and password appear here and on the printed house sheet.",
    secretRef: "wifi_credentials",
    displayOrder: 40,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_waste",
    homeId: "home_lh3",
    sectionType: "waste",
    title: "Trash and recycling",
    body: "There are two trash bins in the kitchen island: one for trash and one for bottles and cans. An overflow trash bin is outside.",
    displayOrder: 60,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_kitchen",
    homeId: "home_lh3",
    sectionType: "food",
    title: "Kitchen",
    body:
      "The cottage has a full kitchen for preparing meals during your stay. The outdoor gas grill must be lit with a lighter; its electronic starter is disabled.\n\nPaper plates and plastic forks are available if you prefer not to wash dishes.",
    displayOrder: 70,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_bathroom",
    homeId: "home_lh3",
    sectionType: "bathroom",
    title: "Bathrooms and outdoor shower",
    body:
      "The outdoor shower is propane on demand. There is no on/off button. Turn on the water with the lower shower knob; the system will activate automatically.\n\nMessage the host if you have any trouble or questions about the setup.",
    displayOrder: 80,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_lake_safety",
    homeId: "home_lh3",
    sectionType: "lake_safety",
    title: "Lake safety",
    body:
      "The cottage includes a private beach, dock, kayaks, and rowboat. Use the lake and watercraft safely, and follow applicable boating and swimming rules.",
    displayOrder: 90,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_boat_dock",
    homeId: "home_lh3",
    sectionType: "water",
    title: "Can I bring my boat and use the dock?",
    body:
      "Yes. You may bring your boat and use the dock. To launch, use the public boat ramp at North of the Border, 1207 US-202, Rindge, NH 03461.",
    displayOrder: 95,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_checkout_towels",
    homeId: "home_lh3",
    sectionType: "checkout",
    title: "Checkout: towels",
    body: "Leave the bedding in place. Gather used towels and put them in the laundry.",
    displayOrder: 110,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lh3_checkout_dishes",
    homeId: "home_lh3",
    sectionType: "checkout",
    title: "Checkout: dishes",
    body: "Clean any remaining dishes and place them in the drying rack.",
    displayOrder: 120,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  }
];

const SEEDED_LOCKS: HomeLockDevice[] = [
  {
    id: "lock_lh2_schlage",
    homeId: "home_lh2",
    seamDeviceId: "4f80fb1f-a8fa-47ea-932d-f9b7dacc7610",
    connectedAccountId: "8bfd1b19-7097-4f34-b14c-c6568667f9f2",
    provider: "Schlage",
    displayName: "Pine Eden",
    model: "be499WB",
    lockState: "locked",
    online: true,
    batteryLevel: 86,
    hasNativeEntryEvents: true,
    accessCodeCount: 0,
    lastSyncedAt: SEED_TIMESTAMP,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  },
  {
    id: "lock_lh3_yale",
    homeId: "home_lh3",
    seamDeviceId: "e010f900-122c-493d-a1c9-2bada43bf48a",
    connectedAccountId: "e6f5545f-be46-41fe-8997-c50f16de0682",
    provider: "Yale",
    displayName: "Front Door",
    model: "Yale Assure for Andersen Patio Doors",
    lockState: "unlocked",
    online: true,
    batteryLevel: 69,
    hasNativeEntryEvents: true,
    accessCodeCount: 0,
    lastSyncedAt: SEED_TIMESTAMP,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  }
];

export function createSeedLocalHomesStore(): LocalHomesStore {
  return {
    schemaVersion: 1,
    homes: structuredClone(SEEDED_HOMES),
    guideSections: structuredClone([...PINE_EDEN_GUIDE_SECTIONS, ...MONOMONAC_GUIDE_SECTIONS]),
    publishedGuides: [],
    inventory: [],
    purchases: [],
    manuals: [],
    media: [],
    airbnbCaptures: [],
    lockDevices: structuredClone(SEEDED_LOCKS),
    lockEvents: [],
    activityEvents: [],
    networkIntegrations: [],
    secrets: [],
    auditEvents: []
  };
}
