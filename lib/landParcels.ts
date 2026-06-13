export type LandParcel = {
  parcelId: string;
  location: string;
  useCode: string;
  acres: number | null;
  acreageLabel?: string;
  source: string;
  note?: string;
};

export type LandMapZone = {
  name: string;
  slug: string;
  parcels: string[];
  tagCount?: number;
  acres: number | null;
  acreageLabel?: string;
  note?: string;
  unitSingular?: string;
  unitPlural?: string;
};

export type MapReferenceImage = {
  slug: string;
  src: string;
  label: string;
  detail: string;
  pages?: {
    src: string;
    label: string;
  }[];
};

export const landParcels: LandParcel[] = [
  {
    parcelId: "M14-0-27.2",
    location: "Retained north parcel / Lake Monomonac",
    useCode: "ANR",
    acres: 51.627,
    source: "ANR 22-158.1",
    note: "Retained north parcel from the M14-0-27 split; the southern parcel is excluded."
  },
  { parcelId: "M9-0-51", location: "Hillside Dr", useCode: "130", acres: 2, source: "AxisGIS" },
  { parcelId: "M9-0-52", location: "Hillside Dr", useCode: "131", acres: 2, source: "AxisGIS" },
  { parcelId: "M9-0-53", location: "Hillside Dr", useCode: "130", acres: 2, source: "AxisGIS" },
  { parcelId: "M9-0-54", location: "Hillside Dr", useCode: "130", acres: 2, source: "AxisGIS" },
  {
    parcelId: "M12-0-45",
    location: "Hilltop Tr",
    useCode: "132",
    acres: null,
    acreageLabel: "TBD",
    source: "Owner correction",
    note: "Partial retained parcel only; the west peninsula portion was sold off."
  },
  { parcelId: "M12-0-47", location: "Hilltop Tr", useCode: "132", acres: 0.35, source: "AxisGIS" },
  { parcelId: "M12-0-28", location: "Lakeview Dr", useCode: "132", acres: 0.35, source: "AxisGIS" },
  { parcelId: "M14-0-105", location: "Lakeview Dr", useCode: "132", acres: 0.43, source: "AxisGIS" },
  { parcelId: "M15-0-69", location: "Lakeview Dr", useCode: "132", acres: 0.06, source: "AxisGIS" },
  {
    parcelId: "M16-0-2",
    location: "Treetop Terrace",
    useCode: "132",
    acres: 0.28,
    source: "Owner grouping"
  },
  {
    parcelId: "M17-0-7",
    location: "Shady Glen Tr",
    useCode: "TBD",
    acres: null,
    acreageLabel: "TBD",
    source: "AxisGIS 2026 geometry",
    note: "AxisGIS has a parcel geometry record, but joined assessment fields are blank."
  },
  {
    parcelId: "M17-0-8",
    location: "Shady Glen Tr",
    useCode: "TBD",
    acres: null,
    acreageLabel: "TBD",
    source: "AxisGIS 2026 geometry",
    note: "AxisGIS has a parcel geometry record, but joined assessment fields are blank."
  },
  {
    parcelId: "M12-0-79",
    location: "Treetop Terrace",
    useCode: "131",
    acres: 26.812,
    source: "Owner grouping"
  }
];

export const landMapZones: LandMapZone[] = [
  {
    name: "Treetop",
    slug: "treetop-terrace",
    parcels: ["M12-0-79", "M16-0-2", "M12-0-45", "M12-0-47"],
    acres: null,
    acreageLabel: "27.442 acres + M12-0-45 remainder TBD",
    note: "Includes the Treetop parcels plus the former Hilltop parcels."
  },
  {
    name: "No Wake",
    slug: "on-the-water",
    parcels: [
      "1 - Island Landing / 8K4P2",
      "2 - Narrow Squeeze / 37TZZ",
      "3 - Solo Lounge / F779V"
    ],
    acres: null,
    acreageLabel: "water-access tags",
    note: "Three assigned water-access tag locations: Island Landing on the small island south of M10-0-47, Narrow Squeeze on M10-0-45, and Solo Lounge at the north/east peninsula tip of M12-0-28.",
    unitSingular: "tag",
    unitPlural: "tags"
  },
  {
    name: "Lakeview",
    slug: "lakeview",
    parcels: ["M12-0-28", "M14-0-105", "M15-0-69", "M17-0-7", "M17-0-8"],
    acres: null,
    acreageLabel: "0.840 acres + Shady Glen acreage TBD",
    note: "Includes the Lakeview parcels plus the two Shady Glen parcels."
  },
  {
    name: "Hillside",
    slug: "monomonac-hill",
    parcels: ["M14-0-27.2", "M9-0-51", "M9-0-52", "M9-0-53", "M9-0-54"],
    tagCount: 4,
    acres: 59.627,
    note:
      "Includes the survey-corrected Monomonac parcel plus the four Hillside Dr parcels. Four Hillside QR tag locations are mapped."
  }
];

export const excludedLandParcels = [
  {
    parcelId: "M14-0-27",
    label: "Southern parcel sold to North County Land Trust",
    source: "ANR 22-158.1 and current AxisGIS reference",
    note: "Do not include this parcel in the owned-land game map."
  },
  {
    parcelId: "M12-0-45 west peninsula",
    label: "Sold-off west peninsula portion of M12-0-45",
    source: "Owner correction from marked Hilltop Terrace drawing",
    note: "Only the retained east/right portion of M12-0-45 should remain in the owned-land game map."
  },
  {
    parcelId: "M10-0-13",
    label: "Sold Lakeview Dr parcel",
    source: "Owner correction",
    note: "Removed from the owned-land game map after sale."
  }
];

export const mapReferenceImages: MapReferenceImage[] = [
  {
    slug: "final-survey-overview",
    src: "/assets/maps/final-survey-overview.png",
    label: "Final survey overview",
    detail: "Six-page Boundary Survey Plan 22-158, dated 12-19-2022.",
    pages: [
      { src: "/assets/maps/final-survey-page-1.png", label: "Survey page 1" },
      { src: "/assets/maps/final-survey-page-2.png", label: "Survey page 2" },
      { src: "/assets/maps/final-survey-page-3.png", label: "Survey page 3" },
      { src: "/assets/maps/final-survey-page-4.png", label: "Survey page 4" },
      { src: "/assets/maps/final-survey-page-5.png", label: "Survey page 5" },
      { src: "/assets/maps/final-survey-page-6.png", label: "Survey page 6" }
    ]
  },
  {
    slug: "anr-tod-famous-split",
    src: "/assets/maps/anr-tod-famous-split.png",
    label: "ANR split - Tod Famous",
    detail: "Shows Parcel A and remaining parcel for M14-0-27 et al."
  },
  {
    slug: "anr-nclt-split",
    src: "/assets/maps/anr-nclt-split.png",
    label: "ANR split - North County Land Trust",
    detail: "Shows the sold parcel and retained remaining parcel context."
  }
];

export const getMapReferenceImage = (slug: string) =>
  mapReferenceImages.find((image) => image.slug === slug);

export const getMapReferencePages = (slug: string) => {
  const image = getMapReferenceImage(slug);

  if (!image) {
    return [];
  }

  return image.pages ?? [{ src: image.src, label: image.label }];
};

export const totalKnownLandAcres = landParcels.reduce(
  (sum, parcel) => sum + (parcel.acres ?? 0),
  0
);
export const totalLandAcres = totalKnownLandAcres;
export const totalLandAcreageLabel = "~90 acres";
