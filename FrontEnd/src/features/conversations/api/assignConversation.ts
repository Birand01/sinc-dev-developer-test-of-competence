import type {
  AssignConversationBody,
  ConversationThreadResponse,
} from '@/features/conversations/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Assign a conversation thread to a sales rep (PATCH /api/conversations/:threadId/assign).
 *
 * Pure HTTP — no React Query here. useAssignConversation pairs this with cache invalidation.
 * Requires JWT. 200 — updated thread; 403 — sales claim forbidden or wrong assignee;
 * 404 — thread or assignee not found. Manager may send assignedTo: null to unassign.
 */
export function assignConversation(
  threadId: string,
  body: AssignConversationBody,
): Promise<ConversationThreadResponse> {
  return apiFetch<ConversationThreadResponse>(
    `/api/conversations/${encodeURIComponent(threadId)}/assign`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
}
