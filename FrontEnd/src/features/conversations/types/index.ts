/**
 * Types for Conversation API JSON (Worker → browser).
 *
 * Source of truth: BackEnd Crm.Api conversationResponseMapper +
 * conversationsSchemas.ts.
 */

import type { ConversationStatus } from '@/features/dashboard/types'

/** Matches Postgres message_sender_type / Crm.Domain MessageSenderType. */
export const MessageSenderType = {
  Client: 'client',
  Team: 'team',
} as const

export type MessageSenderType =
  (typeof MessageSenderType)[keyof typeof MessageSenderType]

/** Body for POST /api/conversations (createConversationBodySchema). */
export type CreateConversationBody = {
  clientId: string
  subject: string
  message: string
}

/** Body for POST /api/conversations/:threadId/messages (sendConversationMessageBodySchema). */
export type SendConversationMessageBody = {
  /** Trimmed non-empty reply text — maps to conversation_messages.body. */
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

/** GET /api/conversations — inbox thread list (array of threads). */
export type ConversationsListResponse = ConversationThreadResponse[]

/** JSON for GET/POST message resources — toConversationMessageResponse. */
export type ConversationMessageResponse = {
  id: string
  threadId: string
  senderId: string
  senderType: MessageSenderType
  body: string
  createdAt: string
}

/** GET /api/conversations/:threadId/messages — transcript (ordered by API). */
export type ConversationMessagesListResponse = ConversationMessageResponse[]
