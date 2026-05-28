import type { Deal } from '../../../../Crm.Domain/entities/Deal';
import type { Profile } from '../../../../Crm.Domain/entities/Profile';
import type { DealStage } from '../../../../Crm.Domain/enums/DealStage';
import {
  canUpdateDeal,
  requiresLostReason,
  shouldRecordStageHistory,
} from '../../../../Crm.Domain/rules/DealRules';
import { updateDealStageError } from '../../errors/updateDealStageError';
import type { IDealStageHistoryRepository } from '../../interfaces/repositories/IDealStageHistoryRepository';
import type { IDealRepository } from '../../interfaces/repositories/IDealRepository';

/** Body for PATCH /api/deals/:dealId/stage (API contract). */
export interface UpdateDealStageInput {
  stage: DealStage;
  lostReason: string | null;
}

/**
 * Use-case: update a deal stage with role and lostReason checks.
 * Used by PATCH /api/deals/:dealId/stage; HTTP mapping stays in Crm.Api.
 */
export class UpdateDealStageService {
  constructor(
    private readonly dealRepository: IDealRepository,
    private readonly dealStageHistoryRepository: IDealStageHistoryRepository,
  ) {}

  async execute(dealId: string, input: UpdateDealStageInput, actor: Profile): Promise<Deal> {
    const deal = await this.dealRepository.getById(dealId);
    if (!deal) {
      throw updateDealStageError('DEAL_NOT_FOUND');
    }

    if (!canUpdateDeal(actor, deal)) {
      throw updateDealStageError('FORBIDDEN');
    }

    if (!requiresLostReason(input.stage, input.lostReason)) {
      throw updateDealStageError('LOST_REASON_REQUIRED');
    }

    const updatedDeal = await this.dealRepository.updateStage(
      dealId,
      input.stage,
      input.lostReason?.trim() || null,
    );

    if (shouldRecordStageHistory(deal.stage, updatedDeal.stage)) {
      await this.dealStageHistoryRepository.create({
        dealId,
        fromStage: deal.stage,
        toStage: updatedDeal.stage,
        changedBy: actor.id,
      });
    }

    return updatedDeal;
  }
}
