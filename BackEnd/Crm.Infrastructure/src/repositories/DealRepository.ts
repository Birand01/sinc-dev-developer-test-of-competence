import type { SupabaseClient } from '@supabase/supabase-js';
import type { DealOwnerCount, DealStageCount } from '../../../Crm.Application/src/dto/dashboard';
import type {
  CreateDealRepositoryInput,
  DealListFilters,
  IDealRepository,
} from '../../../Crm.Application/src/interfaces/repositories/IDealRepository';
import type { Deal } from '../../../Crm.Domain/entities/Deal';
import { DealStage } from '../../../Crm.Domain/enums/DealStage';
import type { DealStage as DealStageType } from '../../../Crm.Domain/enums/DealStage';
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

  /** Groups visible deal rows by pipeline stage (RLS-scoped). */
  async countByStage(): Promise<DealStageCount[]> {
    const { data, error } = await this.supabase.from('deals').select('stage');

    throwIfSupabaseError(error, 'Failed to count deals by stage');

    const counts = new Map<DealStageType, number>();
    for (const stage of Object.values(DealStage)) {
      counts.set(stage, 0);
    }

    for (const row of data ?? []) {
      const stage = row.stage as DealStageType;
      counts.set(stage, (counts.get(stage) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([stage, count]) => ({ stage, count }));
  }

  /** Groups visible deal rows by owner_id; resolves owner display names from profiles. */
  async countByOwner(): Promise<DealOwnerCount[]> {
    const { data, error } = await this.supabase.from('deals').select('owner_id');

    throwIfSupabaseError(error, 'Failed to count deals by owner');

    const countsByOwner = new Map<string | null, number>();
    for (const row of data ?? []) {
      const ownerId = row.owner_id as string | null;
      countsByOwner.set(ownerId, (countsByOwner.get(ownerId) ?? 0) + 1);
    }

    const ownerIds = [...countsByOwner.keys()].filter((id): id is string => id != null);
    const nameById = new Map<string, string>();

    if (ownerIds.length > 0) {
      const { data: profiles, error: profileError } = await this.supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ownerIds);

      throwIfSupabaseError(profileError, 'Failed to load deal owner profiles for dashboard');

      for (const profile of profiles ?? []) {
        nameById.set(profile.id as string, profile.full_name as string);
      }
    }

    return [...countsByOwner.entries()]
      .map(([ownerId, count]) => ({
        ownerId,
        ownerFullName: ownerId ? (nameById.get(ownerId) ?? null) : null,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Newest non-terminal deal title per client (for GET /api/clients list).
   * Won/lost deals are excluded; first row per client_id after updated_at desc wins.
   */
  async getActiveDealTitleByClientIds(clientIds: string[]): Promise<Map<string, string>> {
    if (clientIds.length === 0) {
      return new Map();
    }

    const activeStages = (Object.values(DealStage) as DealStageType[]).filter(
      (stage) => stage !== DealStage.Won && stage !== DealStage.Lost,
    );

    const { data, error } = await this.supabase
      .from('deals')
      .select('client_id, title, updated_at')
      .in('client_id', clientIds)
      .in('stage', activeStages)
      .order('updated_at', { ascending: false });

    throwIfSupabaseError(error, 'Failed to load active deals for client list');

    const titleByClientId = new Map<string, string>();
    for (const row of data ?? []) {
      const clientId = row.client_id as string;
      if (!titleByClientId.has(clientId)) {
        titleByClientId.set(clientId, row.title as string);
      }
    }

    return titleByClientId;
  }
}
