import type { Deal } from '../../../../Crm.Domain/entities/Deal';
import type { DealStage } from '../../../../Crm.Domain/enums/DealStage';

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
  create(input: CreateDealRepositoryInput): Promise<Deal>;
}
