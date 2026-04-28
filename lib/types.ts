export type Zone = "Road Walker" | "Hill Top" | "Tree Top" | "On the Water";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Bonus";

export type Marker = {
  marker_id: string;
  short_code: string;
  url: string;
  marker_number: number;
  marker_name: string;
  zone: Zone;
  difficulty: Difficulty;
  field_note: string;
  challenge: string;
  clue: string;
  is_island: boolean;
  order: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
};

export type QuestStatus = {
  id: string;
  title: string;
  badge: string;
  description: string;
  current: number;
  total: number;
  complete: boolean;
};

export type ScanRecord = {
  player_id: string;
  marker_id: string;
  scanned_at: string;
  user_agent?: string;
};
