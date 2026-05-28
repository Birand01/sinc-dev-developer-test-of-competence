import type { Deal } from '../../../../Crm.Domain/entities/Deal';
import type { DealListFilters, IDealRepository } from '../../interfaces/repositories/IDealRepository';

/**
 * Use-case: list deals with optional filters.
 * Used by GET /api/deals; HTTP status mapping stays in Crm.Api.
 */
export class ListDealsService {
  constructor(private readonly dealRepository: IDealRepository) {}

  async execute(filters?: DealListFilters): Promise<Deal[]> {
    return this.dealRepository.list(filters);
  }
}
