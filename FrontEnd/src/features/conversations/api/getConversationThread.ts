import type { ConversationThreadResponse } from '@/features/conversations/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Fetch a single conversation thread from the Worker (GET /api/conversations/:threadId).
 *
 * Pure HTTP — no React Query here. useConversationThread pairs this with
 * conversationsQueryKeys.detail(threadId).
 * Requires JWT. 404 — unknown or inaccessible thread; 401 — missing/invalid token.
 */
export function getConversationThread(
  threadId: string,
): Promise<ConversationThreadResponse> {
  return apiFetch<ConversationThreadResponse>(
    `/api/conversations/${encodeURIComponent(threadId)}`,
  )
}
