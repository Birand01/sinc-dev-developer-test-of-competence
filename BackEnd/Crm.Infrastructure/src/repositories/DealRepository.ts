import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateDealRepositoryInput,
  DealListFilters,
  IDealRepository,
} from '../../../Crm.Application/src/interfaces/repositories/IDealRepository';
import type { Deal } from '../../../Crm.Domain/entities/Deal';
import {
  mapMaybeSingle,
  mapRowsOrEmpty,
  throwIfSupabaseError,
} from '../helpers/repositoryHelpers';
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
   * Lists deals visible under RLS with optional filters.
   * q performs case-insensitive search on deal title.
   */
  async list(filters?: DealListFilters): Promise<Deal[]> {
    // Base query: RLS already scopes visible deals; newest deals first.
    let query = this.supabase.from('deals').select('*').order('created_at', {
      ascending: false,
    });

    // Optional exact filters from query params.
    if (filters?.stage) {
      query = query.eq('stage', filters.stage);
    }
    if (filters?.ownerId) {
      query = query.eq('owner_id', filters.ownerId);
    }
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }

    // Optional text search on title (case-insensitive, % and _ escaped).
    const q = filters?.q?.trim();
    if (q) {
      const pattern = `%${q.replace(/[%_]/g, '\\$&')}%`;
      query = query.ilike('title', pattern);
    }

    // Execute query and map rows to domain Deal entities.
    const { data, error } = await query;
    throwIfSupabaseError(error, 'Failed to list deals');
    return mapRowsOrEmpty(data as DealRow[] | null, toDeal);
  }

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

    throwIfSupabaseError(error, 'Failed to create deal');

    const deal = await this.getById(id);
    if (!deal) {
      throw new Error(`Failed to load deal ${id} after insert`);
    }

    return deal;
  }

  /**
   * Updates stage/lost_reason on a deal. RLS controls who may update.
   * Update without RETURNING: avoids RLS read-back issues seen with update().select().
   */
  async updateStage(dealId: string, stage: CreateDealRepositoryInput['stage'], lostReason: string | null): Promise<Deal> {
    const { error } = await this.supabase
      .from('deals')
      .update({
        stage,
        lost_reason: lostReason,
      })
      .eq('id', dealId);

    throwIfSupabaseError(error, `Failed to update deal stage ${dealId}`);

    const deal = await this.getById(dealId);
    if (!deal) {
      throw new Error(`Failed to load deal ${dealId} after stage update`);
    }

    return deal;
  }

  /**
   * Updates owner_id on a deal. RLS controls who may reassign ownership.
   * Update without RETURNING: avoids read-back failures on update().select().
   */
  async updateOwner(dealId: string, ownerId: string | null): Promise<Deal> {
    const { error } = await this.supabase
      .from('deals')
      .update({
        owner_id: ownerId,
      })
      .eq('id', dealId);

    throwIfSupabaseError(error, `Failed to update deal owner ${dealId}`);

    const deal = await this.getById(dealId);
    if (!deal) {
      throw new Error(`Failed to load deal ${dealId} after owner update`);
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

    throwIfSupabaseError(error, `Failed to load deal ${id}`);
    return mapMaybeSingle(data as DealRow | null, toDeal);
  }
}
