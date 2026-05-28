import type { DashboardSummary } from '../../../Crm.Application/src/dto/dashboard';

/** API response mapper for GET /api/dashboard. */
export function toDashboardResponse(summary: DashboardSummary) {
  return {
    conversationsByStatus: summary.conversationsByStatus,
    unassignedConversationCount: summary.unassignedConversationCount,
    dealsByStage: summary.dealsByStage,
    dealsByOwner: summary.dealsByOwner,
    recentActivity: summary.recentActivity.map((item) => ({
      type: item.type,
      occurredAt: item.occurredAt.toISOString(),
      summary: item.summary,
      ...(item.threadId ? { threadId: item.threadId } : {}),
      ...(item.dealId ? { dealId: item.dealId } : {}),
      ...(item.clientId ? { clientId: item.clientId } : {}),
    })),
  };
}
