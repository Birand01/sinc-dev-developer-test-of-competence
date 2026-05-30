import type { DealDetail, DealOwnerSummary } from '../../dto/deals/DealDetail';
import type { IClientRepository } from '../../interfaces/repositories/IClientRepository';
import type { IDealNoteRepository } from '../../interfaces/repositories/IDealNoteRepository';
import type { IDealRepository } from '../../interfaces/repositories/IDealRepository';
import type { IDealStageHistoryRepository } from '../../interfaces/repositories/IDealStageHistoryRepository';
import type { IProfileRepository } from '../../interfaces/repositories/IProfileRepository';

/**
 * Use-case: load rich deal details by id.
 * Used by GET /api/deals/:dealId; HTTP status mapping stays in Crm.Api.
 */
export class GetDealDetailService {
  constructor(
    private readonly dealRepository: IDealRepository,
    private readonly clientRepository: IClientRepository,
    private readonly profileRepository: IProfileRepository,
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

    const ownerProfilePromise = deal.ownerId
      ? this.profileRepository.getById(deal.ownerId)
      : Promise.resolve(null);

    const [notes, stageHistory, ownerProfile] = await Promise.all([
      this.dealNoteRepository.listByDealId(dealId),
      this.dealStageHistoryRepository.listByDealId(dealId),
      ownerProfilePromise,
    ]);

    const owner: DealOwnerSummary | null = ownerProfile
      ? { id: ownerProfile.id, fullName: ownerProfile.fullName }
      : null;

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
      owner,
      notes,
      stageHistory,
    };
  }
}
