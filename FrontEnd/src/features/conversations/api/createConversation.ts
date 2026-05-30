import type {
  ConversationThreadResponse,
  CreateConversationBody,
} from '@/features/conversations/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Start a conversation for a client (POST /api/conversations).
 *
 * Requires JWT. 201 — created thread; 400/403/404 — validation or business rules.
 */
export function createConversation(
  body: CreateConversationBody,
): Promise<ConversationThreadResponse> {
  return apiFetch<ConversationThreadResponse>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
