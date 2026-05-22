export type Zone = "Lakeview" | "Hillside" | "Treetop" | "No Wake";

export type Marker = {
  marker_id: string;
  short_code: string;
  url: string;
  marker_number: number;
  marker_name: string;
  zone: Zone;
  field_note: string;
  challenge: string;
  clue: string;
  is_island: boolean;
  order: number;
};

export type ZoneQuest = {
  id: string;
  zone: Zone;
  title: string;
  zoneLabel: string;
  description: string;
};

export type ZoneQuestStatus = ZoneQuest & {
  current: number;
  total: number;
  complete: boolean;
};

export type ScanRecord = {
  player_id: string;
  marker_id: string;
  scanned_at: string;
  user_agent?: string;
  is_test?: boolean;
};
