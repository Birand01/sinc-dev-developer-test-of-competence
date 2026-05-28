import type { Deal } from '../../../../Crm.Domain/entities/Deal';
import type { IDealRepository } from '../../interfaces/repositories/IDealRepository';

/**
 * Use-case: load a single deal by id.
 * Used by GET /api/deals/:dealId; HTTP status mapping stays in Crm.Api.
 */
export class GetDealByIdService {
  constructor(private readonly dealRepository: IDealRepository) {}

  async execute(dealId: string): Promise<Deal | null> {
    return this.dealRepository.getById(dealId);
  }
}
