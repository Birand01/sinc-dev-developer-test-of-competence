import type { SupabaseClient } from '@supabase/supabase-js';
import type { DealStageHistory } from '../../../Crm.Domain/entities/DealStageHistory';
import {
  toDealStageHistory,
  type DealStageHistoryRow,
} from '../mappers/dealStageHistoryMapper';

/**
 * Data access for public.deal_stage_history (Supabase Postgres).
 *
 * Project flow: Api → createSupabaseUserClient → DealStageHistoryRepository
 * → query (RLS via can_access_deal on deal_id) → mapper → domain entity.
 *
 * select('*'): mapper maps only known fields; single-table query.
 */
export class DealStageHistoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Returns the history entry or null if not found / not visible under RLS.
   * maybeSingle: 0 rows → null; 1 row → data; 2+ rows → error.
   */
  async getById(id: string): Promise<DealStageHistory | null> {
    const { data, error } = await this.supabase
      .from('deal_stage_history')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load deal stage history ${id}: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return toDealStageHistory(data as DealStageHistoryRow);
  }
}
