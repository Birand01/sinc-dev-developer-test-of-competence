import type { SupabaseClient } from '@supabase/supabase-js';
import type { Deal } from '../../../Crm.Domain/entities/Deal';
import { toDeal, type DealRow } from '../mappers/dealMapper';

/**
 * Data access for public.deals (Supabase Postgres).
 *
 * Project flow: Api → createSupabaseUserClient → DealRepository
 * → query (RLS via can_access_deal) → dealMapper → domain Deal.
 *
 * select('*'): mapper maps only known fields; single-table query.
 */
export class DealRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Returns the deal or null if not found / not visible under RLS.
   * maybeSingle: 0 rows → null; 1 row → data; 2+ rows → error.
   */
  async getById(id: string): Promise<Deal | null> {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load deal ${id}: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return toDeal(data as DealRow);
  }
}
