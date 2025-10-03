/**
 * Defines the possible icons that can be displayed in a table cell.
 */
export type IconType = 'check' | 'cross' | null;


/**
 * Represents the data structure for a single cell in a comparison column.
 */
export interface CellData {
  /**
   * The text value of the cell. If `null`, the cell may instead display an icon.
   */
  value: string | null;

  /**
   * Whether this cell belongs to the primary column (e.g., the highlighted product).
   */
  isPrimary?: boolean;

  /**
   * An optional icon to display in the cell (e.g., checkmark or cross).
   */
  icon?: IconType;

  /**
   * An optional note or tooltip providing extra information about the cell.
   */
  note?: string;
}


/**
 * Represents the structure for a full row in the comparison table.
 */
export interface TableRow {
  /**
   * The feature or category being compared in this row.
   */
  feature: string;

  /**
   * Marks the row as a header row if true.
   */
  isHeader?: boolean;

  /**
   * Cell data for Sonacove's column.
   */
  sonacove: CellData;

  /**
   * Cell data for Zoom's column.
   */
  zoom: CellData;

  /**
   * Cell data for Google Meet's column.
   */
  googleMeet: CellData;
}


/**
 * Represents the structure for a header column in the comparison table.
 */
export interface Column {
  /**
   * The display title of the column (e.g., "Sonacove").
   */
  title: string;

  /**
   * Whether this column is considered the primary column.
   */
  isPrimary?: boolean;
}
