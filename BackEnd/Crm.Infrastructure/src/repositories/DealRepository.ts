import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateDealRepositoryInput,
  IDealRepository,
} from '../../../Crm.Application/src/interfaces/repositories/IDealRepository';
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
export class DealRepository implements IDealRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Inserts a new deal row.
   * Insert without RETURNING to avoid RLS read-back failures on insert().select().
   */
  async create(input: CreateDealRepositoryInput): Promise<Deal> {
    const id = crypto.randomUUID();

    const { error } = await this.supabase.from('deals').insert({
      id,
      client_id: input.clientId,
      owner_id: input.ownerId,
      title: input.title,
      stage: input.stage,
      expected_intake: input.expectedIntake,
      value_amount: input.valueAmount,
      value_currency: input.valueCurrency,
      lost_reason: input.lostReason,
    });

    if (error) {
      throw new Error(`Failed to create deal: ${error.message}`);
    }

    const deal = await this.getById(id);
    if (!deal) {
      throw new Error(`Failed to load deal ${id} after insert`);
    }

    return deal;
  }

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
