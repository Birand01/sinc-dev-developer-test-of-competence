import type { ConversationStatus } from '../../../../Crm.Domain/enums/ConversationStatus';
import type { DealStage } from '../../../../Crm.Domain/enums/DealStage';

/** Conversation thread count for a single status bucket. */
export interface ConversationStatusCount {
  status: ConversationStatus;
  count: number;
}

/** Deal count for a single pipeline stage bucket. */
export interface DealStageCount {
  stage: DealStage;
  count: number;
}

/** Deal count grouped by owner; null ownerId = unassigned deals. */
export interface DealOwnerCount {
  ownerId: string | null;
  /** Display name when ownerId is set; null for unassigned bucket. */
  ownerFullName: string | null;
  count: number;
}

/** Unified activity feed item for the dashboard timeline. */
export type DashboardActivityType =
  | 'conversation_message'
  | 'deal_stage_change'
  | 'deal_note';

export interface DashboardActivityItem {
  type: DashboardActivityType;
  occurredAt: Date;
  /** Human-readable line for the activity feed (e.g. subject, stage change, note preview). */
  summary: string;
  /** Optional navigation targets for the UI. */
  threadId?: string;
  dealId?: string;
  clientId?: string;
}

/**
 * Rich payload contract for GET /api/dashboard.
 * Manager/sales scoped aggregates; assembled by GetDashboardService.
 */
export interface DashboardSummary {
  conversationsByStatus: ConversationStatusCount[];
  unassignedConversationCount: number;
  dealsByStage: DealStageCount[];
  dealsByOwner: DealOwnerCount[];
  recentActivity: DashboardActivityItem[];
}
