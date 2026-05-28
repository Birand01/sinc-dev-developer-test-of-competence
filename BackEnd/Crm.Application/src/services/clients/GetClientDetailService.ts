import type { ClientDetail } from '../../dto/clients/ClientDetail';
import type { IClientRepository } from '../../interfaces/repositories/IClientRepository';
import type { IConversationThreadRepository } from '../../interfaces/repositories/IConversationThreadRepository';
import type { IDashboardActivityRepository } from '../../interfaces/repositories/IDashboardActivityRepository';
import type { IDealRepository } from '../../interfaces/repositories/IDealRepository';

const DEFAULT_RECENT_ACTIVITY_LIMIT = 20;

/**
 * Use-case: load rich client details by id.
 * Used by GET /api/clients/:clientId; HTTP status mapping stays in Crm.Api.
 */
export class GetClientDetailService {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly conversationThreadRepository: IConversationThreadRepository,
    private readonly dealRepository: IDealRepository,
    private readonly dashboardActivityRepository: IDashboardActivityRepository,
  ) {}

  async execute(clientId: string): Promise<ClientDetail | null> {
    const client = await this.clientRepository.getById(clientId);
    if (!client) {
      return null;
    }

    const [conversations, deals, recentActivity] = await Promise.all([
      this.conversationThreadRepository.listByClientId(clientId),
      this.dealRepository.list({ clientId }),
      this.dashboardActivityRepository.listRecentActivityByClientId(
        clientId,
        DEFAULT_RECENT_ACTIVITY_LIMIT,
      ),
    ]);

    return {
      client,
      conversations,
      deals,
      recentActivity,
    };
  }
}
