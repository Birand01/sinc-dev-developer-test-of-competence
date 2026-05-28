import type { DashboardSummary } from '../../dto/dashboard';
import type { IConversationThreadRepository } from '../../interfaces/repositories/IConversationThreadRepository';
import type { IDashboardActivityRepository } from '../../interfaces/repositories/IDashboardActivityRepository';
import type { IDealRepository } from '../../interfaces/repositories/IDealRepository';

const DEFAULT_RECENT_ACTIVITY_LIMIT = 20;

/**
 * Use-case: load manager/sales dashboard aggregates.
 * Used by GET /api/dashboard; HTTP status mapping stays in Crm.Api.
 */
export class GetDashboardService {
  constructor(
    private readonly conversationThreadRepository: IConversationThreadRepository,
    private readonly dealRepository: IDealRepository,
    private readonly dashboardActivityRepository: IDashboardActivityRepository,
  ) {}

  async execute(): Promise<DashboardSummary> {
    const [
      conversationsByStatus,
      unassignedConversationCount,
      dealsByStage,
      dealsByOwner,
      recentActivity,
    ] = await Promise.all([
      this.conversationThreadRepository.countByStatus(),
      this.conversationThreadRepository.countUnassigned(),
      this.dealRepository.countByStage(),
      this.dealRepository.countByOwner(),
      this.dashboardActivityRepository.listRecentActivity(DEFAULT_RECENT_ACTIVITY_LIMIT),
    ]);

    return {
      conversationsByStatus,
      unassignedConversationCount,
      dealsByStage,
      dealsByOwner,
      recentActivity,
    };
  }
}
