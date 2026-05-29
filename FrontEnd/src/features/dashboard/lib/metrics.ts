import type { ConversationStatusCount, DashboardResponse, DealStageCount } from '@/features/dashboard/types'
import { ConversationStatus, DealStage } from '@/features/dashboard/types'

/** KPI numbers derived from GET /api/dashboard — pure functions, no React. */

function countByConversationStatus(
  items: ConversationStatusCount[],
  status: ConversationStatusCount['status'],
): number {
  return items.find((item) => item.status === status)?.count ?? 0
}

function countByDealStage(
  items: DealStageCount[],
  stage: DealStageCount['stage'],
): number {
  return items.find((item) => item.stage === stage)?.count ?? 0
}

/** Open + pending threads (wireframe "Open Chats"). */
export function getOpenChatsCount(conversationsByStatus: ConversationStatusCount[]): number {
  return (
    countByConversationStatus(conversationsByStatus, ConversationStatus.Open) +
    countByConversationStatus(conversationsByStatus, ConversationStatus.Pending)
  )
}

/** Pipeline deals excluding terminal won/lost stages. */
export function getActiveDealsCount(dealsByStage: DealStageCount[]): number {
  return dealsByStage
    .filter(
      (item) => item.stage !== DealStage.Won && item.stage !== DealStage.Lost,
    )
    .reduce((sum, item) => sum + item.count, 0)
}

/** Won stage bucket only. */
export function getWonDealsCount(dealsByStage: DealStageCount[]): number {
  return countByDealStage(dealsByStage, DealStage.Won)
}

/** All four KPI card values in one object for DashboardKpiRow. */
export function getDashboardKpis(summary: DashboardResponse) {
  return {
    openChats: getOpenChatsCount(summary.conversationsByStatus),
    unassignedConversations: summary.unassignedConversationCount,
    activeDeals: getActiveDealsCount(summary.dealsByStage),
    wonDeals: getWonDealsCount(summary.dealsByStage),
  }
}

export type DashboardKpis = ReturnType<typeof getDashboardKpis>
