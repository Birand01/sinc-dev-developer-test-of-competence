import type { SupabaseClient } from '@supabase/supabase-js';
import type { DealNote } from '../../../Crm.Domain/entities/DealNote';
import { mapMaybeSingle, throwIfSupabaseError } from '../helpers/repositoryHelpers';
import { toDealNote, type DealNoteRow } from '../mappers/dealNoteMapper';

/**
 * Data access for public.deal_notes (Supabase Postgres).
 *
 * Project flow: Api → createSupabaseUserClient → DealNoteRepository
 * → query (RLS: can_access_deal + sales/manager only) → mapper → domain entity.
 *
 * select('*'): mapper maps only known fields; single-table query.
 */
export class DealNoteRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Returns the note or null if not found / not visible under RLS.
   * maybeSingle: 0 rows → null; 1 row → data; 2+ rows → error.
   */
  async getById(id: string): Promise<DealNote | null> {
    const { data, error } = await this.supabase
      .from('deal_notes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    throwIfSupabaseError(error, `Failed to load deal note ${id}`);
    return mapMaybeSingle(data as DealNoteRow | null, toDealNote);
  }
}
