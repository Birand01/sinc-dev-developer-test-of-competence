/**
 * Types for Client API JSON (Worker → browser).
 *
 * Source of truth: BackEnd Crm.Api clientResponseMapper,
 * conversationResponseMapper, dealResponseMapper + routes/clients.ts.
 */

import type { ConversationStatus, DealStage } from '@/features/dashboard/types'

/** Single row from GET /api/clients (200). */
export type ClientResponse = {
  id: string
  /** profiles.id when client has login; null for lead-only records */
  profileId: string | null
  fullName: string
  email: string | null
  phone: string | null
  country: string | null
  targetCountry: string | null
  /** profiles.id of sales/manager who created the record */
  createdBy: string | null
  createdAt: string
  updatedAt: string
  /** Newest open pipeline deal title; null when none (GET /api/clients). */
  activeDealTitle: string | null
}

/** GET /api/clients returns a JSON array of clients. */
export type ClientsListResponse = ClientResponse[]

/** Optional query params for GET /api/clients (?q=&ownerId=). */
export type ListClientsParams = {
  q?: string
  ownerId?: string
}

/** Client object inside GET /api/clients/:clientId (no list-only activeDealTitle). */
export type ClientDetailClientResponse = Omit<ClientResponse, 'activeDealTitle'>

/** Conversation thread row in client detail (toConversationThreadResponse). */
export type ConversationThreadResponse = {
  id: string
  clientId: string
  /** profiles.id of assigned staff; null when unassigned */
  assignedTo: string | null
  subject: string
  status: ConversationStatus
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}

/** Deal row in client detail (toDealResponse). */
export type DealResponse = {
  id: string
  clientId: string
  /** profiles.id of owning sales rep; null when unassigned */
  ownerId: string | null
  title: string
  stage: DealStage
  valueAmount: number | null
  valueCurrency: string | null
  expectedIntake: string | null
  lostReason: string | null
  createdAt: string
  updatedAt: string
}

/** Activity feed row in client detail; dates are ISO strings over HTTP. */
export type ClientActivityType =
  | 'conversation_message'
  | 'deal_stage_change'
  | 'deal_note'

export type ClientActivityItem = {
  type: ClientActivityType
  occurredAt: string
  summary: string
  threadId?: string
  dealId?: string
  clientId?: string
}

/** JSON body for GET /api/clients/:clientId (200). */
export type ClientDetailResponse = {
  client: ClientDetailClientResponse
  conversations: ConversationThreadResponse[]
  deals: DealResponse[]
  recentActivity: ClientActivityItem[]
}
