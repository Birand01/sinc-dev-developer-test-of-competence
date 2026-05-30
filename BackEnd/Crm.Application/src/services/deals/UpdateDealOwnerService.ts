import type { Deal } from '../../../../Crm.Domain/entities/Deal';
import type { Profile } from '../../../../Crm.Domain/entities/Profile';
import { AppRole } from '../../../../Crm.Domain/enums/AppRole';
import { canClaimDeal, canReassignDealOwner } from '../../../../Crm.Domain/rules/DealRules';
import { updateDealOwnerError } from '../../errors/updateDealOwnerError';
import type { IDealRepository } from '../../interfaces/repositories/IDealRepository';
import type { IProfileRepository } from '../../interfaces/repositories/IProfileRepository';

/** Body for PATCH /api/deals/:dealId/owner (API contract). */
export interface UpdateDealOwnerInput {
  ownerId: string | null;
}

/**
 * Use-case: reassign or claim deal ownership with role validations.
 * Manager: PATCH owner to any sales rep or null (unassigned pool).
 * Sales: claim unassigned deals only (ownerId must be self).
 * Used by PATCH /api/deals/:dealId/owner; HTTP mapping stays in Crm.Api.
 */
export class UpdateDealOwnerService {
  constructor(
    private readonly dealRepository: IDealRepository,
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(dealId: string, input: UpdateDealOwnerInput, actor: Profile): Promise<Deal> {
    const deal = await this.dealRepository.getById(dealId);
    if (!deal) {
      throw updateDealOwnerError('DEAL_NOT_FOUND');
    }

    if (!canReassignDealOwner(actor)) {
      if (!canClaimDeal(actor, deal)) {
        throw updateDealOwnerError('FORBIDDEN');
      }

      if (input.ownerId !== actor.id) {
        throw updateDealOwnerError('SALES_MUST_CLAIM_SELF');
      }

      return this.dealRepository.updateOwner(dealId, actor.id);
    }

    if (input.ownerId) {
      const owner = await this.profileRepository.getById(input.ownerId);
      if (!owner) {
        throw updateDealOwnerError('OWNER_NOT_FOUND');
      }
      if (owner.role !== AppRole.Sales) {
        throw updateDealOwnerError('OWNER_NOT_SALES');
      }
    }

    return this.dealRepository.updateOwner(dealId, input.ownerId);
  }
}
