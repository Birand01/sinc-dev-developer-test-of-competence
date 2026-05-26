/**
 * Internal note on a deal (deal_notes table).
 * Visible to sales/manager; not the same as client chat messages.
 */
export interface DealNote {
  id: string;
  /** deals.id */
  dealId: string;
  /** profiles.id */
  authorId: string;
  body: string;
  createdAt: Date;
}
