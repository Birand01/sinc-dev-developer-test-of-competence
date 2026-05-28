import type { Deal } from '../../../../Crm.Domain/entities/Deal';
import type { DealStage } from '../../../../Crm.Domain/enums/DealStage';

/** Filters for GET /api/deals query params. */
export interface DealListFilters {
  stage?: DealStage;
  ownerId?: string;
  clientId?: string;
  q?: string;
}

/** Body fields used when creating a deal. */
export interface CreateDealRepositoryInput {
  clientId: string;
  title: string;
  ownerId: string | null;
  stage: DealStage;
  expectedIntake: string | null;
  valueAmount: number | null;
  valueCurrency: string | null;
  lostReason: string | null;
}

/**
 * Port for deals (deals table).
 * Implemented by Crm.Infrastructure; consumed by Application use-cases.
 */
export interface IDealRepository {
  getById(id: string): Promise<Deal | null>;
  list(filters?: DealListFilters): Promise<Deal[]>;
  create(input: CreateDealRepositoryInput): Promise<Deal>;
  updateStage(dealId: string, stage: DealStage, lostReason: string | null): Promise<Deal>;
  updateOwner(dealId: string, ownerId: string | null): Promise<Deal>;
}
