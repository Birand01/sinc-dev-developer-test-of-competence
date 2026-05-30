import type { Deal } from '../../../../Crm.Domain/entities/Deal';
import type { Profile } from '../../../../Crm.Domain/entities/Profile';
import { AppRole } from '../../../../Crm.Domain/enums/AppRole';
import { DealStage } from '../../../../Crm.Domain/enums/DealStage';
import { canCreateDeal } from '../../../../Crm.Domain/rules/DealRules';
import { isSales } from '../../../../Crm.Domain/rules/helpers';
import { createDealError } from '../../errors/createDealError';
import type { IClientRepository } from '../../interfaces/repositories/IClientRepository';
import type { IProfileRepository } from '../../interfaces/repositories/IProfileRepository';
import type {
  CreateDealRepositoryInput,
  IDealRepository,
} from '../../interfaces/repositories/IDealRepository';

/** Body for POST /api/deals (API contract). */
export interface CreateDealInput {
  clientId: string;
  title: string;
  ownerId: string | null;
  expectedIntake: string | null;
  valueAmount: number | null;
  valueCurrency: string | null;
}

/**
 * Use-case: create a new sales deal for a client.
 * Business rules will be added incrementally in next steps.
 */
export class CreateDealService {
  constructor(
    private readonly dealRepository: IDealRepository,
    private readonly clientRepository: IClientRepository,
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(input: CreateDealInput, actor: Profile): Promise<Deal> {
    // Only sales/manager roles can create a deal.
    if (!canCreateDeal(actor)) {
      throw createDealError('FORBIDDEN');
    }

    // Deal must belong to an existing client.
    const client = await this.clientRepository.getById(input.clientId);
    if (!client) {
      throw createDealError('CLIENT_NOT_FOUND');
    }

    // Sales creating without ownerId → assign to self ("can own deals").
    // Manager may omit ownerId to leave deal in the unassigned pool.
    const ownerId =
      input.ownerId ?? (isSales(actor) ? actor.id : null);

    // If owner is set, it must exist and be a sales profile.
    if (ownerId) {
      const owner = await this.profileRepository.getById(ownerId);
      if (!owner) {
        throw createDealError('OWNER_NOT_FOUND');
      }
      if (owner.role !== AppRole.Sales) {
        throw createDealError('OWNER_NOT_SALES');
      }
    }

    const createInput: CreateDealRepositoryInput = {
      ...input,
      ownerId,
      stage: DealStage.NewLead,
      lostReason: null,
    };

    return this.dealRepository.create(createInput);
  }
}
