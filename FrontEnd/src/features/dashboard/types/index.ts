/**
 * Types for GET /api/dashboard JSON (Worker → browser).
 *
 * Source of truth: BackEnd Crm.Api dashboardResponseMapper + Crm.Application DashboardSummary.
 * Manager/sales only — client role gets 403 from the API.
 */

/** Matches Postgres conversation_status / Crm.Domain ConversationStatus. */
export const ConversationStatus = {
  Open: 'open',
  Pending: 'pending',
  Closed: 'closed',
} as const

export type ConversationStatus =
  (typeof ConversationStatus)[keyof typeof ConversationStatus]

/** Matches Postgres deal_stage / Crm.Domain DealStage. */
export const DealStage = {
  NewLead: 'new_lead',
  Contacted: 'contacted',
  ConsultationBooked: 'consultation_booked',
  DocumentsRequested: 'documents_requested',
  ApplicationStarted: 'application_started',
  Submitted: 'submitted',
  Won: 'won',
  Lost: 'lost',
} as const

export type DealStage = (typeof DealStage)[keyof typeof DealStage]

export type DashboardActivityType =
  | 'conversation_message'
  | 'deal_stage_change'
  | 'deal_note'

export type ConversationStatusCount = {
  status: ConversationStatus
  count: number
}

export type DealStageCount = {
  stage: DealStage
  count: number
}

export type DealOwnerCount = {
  ownerId: string | null
  ownerFullName: string | null
  count: number
}

/** Activity feed row; dates are ISO strings over HTTP. */
export type DashboardActivityItem = {
  type: DashboardActivityType
  occurredAt: string
  summary: string
  threadId?: string
  dealId?: string
  clientId?: string
}

/** JSON body for GET /api/dashboard (200). */
export type DashboardResponse = {
  conversationsByStatus: ConversationStatusCount[]
  unassignedConversationCount: number
  dealsByStage: DealStageCount[]
  dealsByOwner: DealOwnerCount[]
  recentActivity: DashboardActivityItem[]
}
