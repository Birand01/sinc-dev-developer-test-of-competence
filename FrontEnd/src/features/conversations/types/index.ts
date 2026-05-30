/**
 * Types for Conversation API JSON (Worker → browser).
 *
 * Source of truth: BackEnd Crm.Api conversationResponseMapper +
 * conversationsSchemas.ts.
 */

import type { ConversationStatus } from '@/features/dashboard/types'

/** Body for POST /api/conversations (createConversationBodySchema). */
export type CreateConversationBody = {
  clientId: string
  subject: string
  message: string
}

/** JSON body for POST /api/conversations (201) — toConversationThreadResponse. */
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
