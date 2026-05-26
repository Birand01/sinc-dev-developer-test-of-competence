import type { DealNote } from '../../../Crm.Domain/entities/DealNote';

/** Row shape returned by Supabase from public.deal_notes (snake_case). */
export type DealNoteRow = {
  id: string;
  deal_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

/** Maps a Supabase deal_notes row to the domain DealNote entity. */
export function toDealNote(row: DealNoteRow): DealNote {
  return {
    id: row.id,
    dealId: row.deal_id,
    authorId: row.author_id,
    body: row.body,
    createdAt: new Date(row.created_at),
  };
}
