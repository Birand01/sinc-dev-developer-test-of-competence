import type {
  ConversationMessageResponse,
  SendConversationMessageBody,
} from '@/features/conversations/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Send a reply on an existing thread (POST /api/conversations/:threadId/messages).
 *
 * Pure HTTP — no React Query here. useSendConversationMessage pairs this with
 * conversationsQueryKeys.messages / detail / allLists invalidation.
 *
 * Requires JWT. 201 — created message (senderType team for staff);
 * 403 — sales on another rep's thread; 404 — thread not found.
 */
export function sendConversationMessage(
  threadId: string,
  body: SendConversationMessageBody,
): Promise<ConversationMessageResponse> {
  return apiFetch<ConversationMessageResponse>(
    `/api/conversations/${encodeURIComponent(threadId)}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}
