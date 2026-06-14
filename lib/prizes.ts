import { TOTAL_MARKERS } from "@/lib/game";

export const FINAL_PRIZE = {
  id: "lake-monomonac-2026-final",
  title: "3D Printed Lake Monomonac",
  href: "/prize/lakemonomonac2026",
  markerGoalLabel: `all ${TOTAL_MARKERS} markers`,
  visibility: "hidden-until-complete",
  awardMode: "single-grand-prize"
} as const;
