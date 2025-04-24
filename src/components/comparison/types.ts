export type IconType = "check" | "cross" | null;

export interface CellData {
  value: string | null;
  isPrimary?: boolean;
  icon?: IconType;
  note?: string;
}

export interface TableRow {
  feature: string;
  isHeader?: boolean;
  sonacove: CellData;
  zoom: CellData;
  googleMeet: CellData;
}

export interface Column {
  title: string;
  isPrimary?: boolean;
}
