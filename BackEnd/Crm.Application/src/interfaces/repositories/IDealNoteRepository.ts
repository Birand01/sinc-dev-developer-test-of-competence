import type { DealNote } from '../../../../Crm.Domain/entities/DealNote';

/** Input used when creating a note for a deal. */
export interface CreateDealNoteInput {
  dealId: string;
  authorId: string;
  body: string;
}

/**
 * Port for deal notes (deal_notes table).
 * Implemented by Crm.Infrastructure; consumed by Application use-cases.
 */
export interface IDealNoteRepository {
  create(input: CreateDealNoteInput): Promise<DealNote>;
}
