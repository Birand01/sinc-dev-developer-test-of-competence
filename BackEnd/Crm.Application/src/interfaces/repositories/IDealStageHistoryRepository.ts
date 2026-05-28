import type { DealStageHistory } from '../../../../Crm.Domain/entities/DealStageHistory';
import type { DealStage } from '../../../../Crm.Domain/enums/DealStage';

/** Input used when recording a deal stage transition audit row. */
export interface CreateDealStageHistoryInput {
  dealId: string;
  fromStage: DealStage | null;
  toStage: DealStage;
  changedBy: string;
}

/**
 * Port for deal stage history (deal_stage_history table).
 * Implemented by Crm.Infrastructure; consumed by Application use-cases.
 */
export interface IDealStageHistoryRepository {
  create(input: CreateDealStageHistoryInput): Promise<DealStageHistory>;
}
