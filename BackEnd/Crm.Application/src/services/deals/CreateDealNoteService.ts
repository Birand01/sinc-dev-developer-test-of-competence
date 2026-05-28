import type { DealNote } from '../../../../Crm.Domain/entities/DealNote';
import type { Profile } from '../../../../Crm.Domain/entities/Profile';
import { canUpdateDeal } from '../../../../Crm.Domain/rules/DealRules';
import { createDealNoteError } from '../../errors/createDealNoteError';
import type { IDealNoteRepository } from '../../interfaces/repositories/IDealNoteRepository';
import type { IDealRepository } from '../../interfaces/repositories/IDealRepository';

/** Body for POST /api/deals/:dealId/notes (API contract). */
export interface CreateDealNoteInput {
  body: string;
}

/**
 * Use-case: add an internal note to a deal.
 * Used by POST /api/deals/:dealId/notes; HTTP mapping stays in Crm.Api.
 */
export class CreateDealNoteService {
  constructor(
    private readonly dealRepository: IDealRepository,
    private readonly dealNoteRepository: IDealNoteRepository,
  ) {}

  async execute(dealId: string, input: CreateDealNoteInput, actor: Profile): Promise<DealNote> {
    const deal = await this.dealRepository.getById(dealId);
    if (!deal) {
      throw createDealNoteError('DEAL_NOT_FOUND');
    }

    if (!canUpdateDeal(actor, deal)) {
      throw createDealNoteError('FORBIDDEN');
    }

    const body = input.body.trim();
    if (!body) {
      throw createDealNoteError('BODY_REQUIRED');
    }

    return this.dealNoteRepository.create({
      dealId,
      authorId: actor.id,
      body,
    });
  }
}
