import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateDealStageHistoryInput,
  IDealStageHistoryRepository,
} from '../../../Crm.Application/src/interfaces/repositories/IDealStageHistoryRepository';
import type { DealStageHistory } from '../../../Crm.Domain/entities/DealStageHistory';
import {
  mapMaybeSingle,
  mapRowsOrEmpty,
  throwIfSupabaseError,
} from '../helpers/repositoryHelpers';
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
export class DealStageHistoryRepository implements IDealStageHistoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Inserts a new deal_stage_history row.
   * Insert without RETURNING to avoid RLS read-back failures on insert().select().
   */
  async create(input: CreateDealStageHistoryInput): Promise<DealStageHistory> {
    const id = crypto.randomUUID();

    const { error } = await this.supabase.from('deal_stage_history').insert({
      id,
      deal_id: input.dealId,
      from_stage: input.fromStage,
      to_stage: input.toStage,
      changed_by: input.changedBy,
    });

    throwIfSupabaseError(error, `Failed to create deal stage history for deal ${input.dealId}`);

    const history = await this.getById(id);
    if (!history) {
      throw new Error(`Failed to load deal stage history ${id} after insert`);
    }

    return history;
  }

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

    throwIfSupabaseError(error, `Failed to load deal stage history ${id}`);
    return mapMaybeSingle(data as DealStageHistoryRow | null, toDealStageHistory);
  }

  /** Returns stage history entries for a deal ordered by newest first. */
  async listByDealId(dealId: string): Promise<DealStageHistory[]> {
    const { data, error } = await this.supabase
      .from('deal_stage_history')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    throwIfSupabaseError(error, `Failed to list deal stage history for deal ${dealId}`);
    return mapRowsOrEmpty(data as DealStageHistoryRow[] | null, toDealStageHistory);
  }
}
