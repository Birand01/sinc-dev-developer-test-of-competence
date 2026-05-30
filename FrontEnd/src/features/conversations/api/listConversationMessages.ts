import type { ConversationMessagesListResponse } from '@/features/conversations/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Fetch message transcript for a thread (GET /api/conversations/:threadId/messages).
 *
 * Pure HTTP — no React Query here. useConversationMessages pairs this with
 * conversationsQueryKeys.messages(threadId).
 * Requires JWT. 404 — unknown or inaccessible thread; 401 — missing/invalid token.
 */
export function listConversationMessages(
  threadId: string,
): Promise<ConversationMessagesListResponse> {
  return apiFetch<ConversationMessagesListResponse>(
    `/api/conversations/${encodeURIComponent(threadId)}/messages`,
  )
}
