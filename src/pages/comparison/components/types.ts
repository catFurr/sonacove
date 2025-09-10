// --- Type Definitions for the Comparison Table Components ---

/** Defines the possible icons that can be displayed in a table cell. */
export type IconType = 'check' | 'cross' | null;

/** Defines the data structure for a single cell in a comparison column. */
export interface CellData {
  value: string | null;
  isPrimary?: boolean;
  icon?: IconType;
  note?: string;
}

/** Defines the structure for a full row in the comparison table. */
export interface TableRow {
  feature: string;
  isHeader?: boolean;
  sonacove: CellData;
  zoom: CellData;
  googleMeet: CellData;
}

/** Defines the structure for a header column in the comparison table. */
export interface Column {
  title: string;
  isPrimary?: boolean;
}
