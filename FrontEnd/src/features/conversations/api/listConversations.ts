import type { ConversationsListResponse } from '@/features/conversations/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Fetch staff inbox threads from the Worker (GET /api/conversations).
 *
 * Pure HTTP — no React Query here. useConversations pairs this with
 * conversationsQueryKeys.list().
 */
export function listConversations(): Promise<ConversationsListResponse> {
  return apiFetch<ConversationsListResponse>('/api/conversations')
}
