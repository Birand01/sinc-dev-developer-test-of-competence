import type { DealDetail } from '../../dto/deals/DealDetail';
import type { IClientRepository } from '../../interfaces/repositories/IClientRepository';
import type { IDealNoteRepository } from '../../interfaces/repositories/IDealNoteRepository';
import type { IDealRepository } from '../../interfaces/repositories/IDealRepository';
import type { IDealStageHistoryRepository } from '../../interfaces/repositories/IDealStageHistoryRepository';

/**
 * Use-case: load rich deal details by id.
 * Used by GET /api/deals/:dealId; HTTP status mapping stays in Crm.Api.
 */
export class GetDealDetailService {
  constructor(
    private readonly dealRepository: IDealRepository,
    private readonly clientRepository: IClientRepository,
    private readonly dealNoteRepository: IDealNoteRepository,
    private readonly dealStageHistoryRepository: IDealStageHistoryRepository,
  ) {}

  async execute(dealId: string): Promise<DealDetail | null> {
    const deal = await this.dealRepository.getById(dealId);
    if (!deal) {
      return null;
    }

    const client = await this.clientRepository.getById(deal.clientId);
    if (!client) {
      return null;
    }

    const [notes, stageHistory] = await Promise.all([
      this.dealNoteRepository.listByDealId(dealId),
      this.dealStageHistoryRepository.listByDealId(dealId),
    ]);

    return {
      deal,
      client: {
        id: client.id,
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        country: client.country,
        targetCountry: client.targetCountry,
      },
      notes,
      stageHistory,
    };
  }
}
