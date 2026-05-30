import { useMutation, useQueryClient } from '@tanstack/react-query'

import { sendConversationMessage } from '@/features/conversations/api/sendConversationMessage'
import { conversationsQueryKeys } from '@/features/conversations/lib/queryKeys'
import type { SendConversationMessageBody } from '@/features/conversations/types'

type UseSendConversationMessageOptions = {
  threadId: string
}

/**
 * Send a staff reply (POST /api/conversations/:threadId/messages) and refresh inbox caches.
 *
 * onSuccess invalidates:
 * - message transcript for this thread (ConversationMessageList)
 * - thread header (lastMessageAt after refetch)
 * - inbox list (queue sort / preview)
 */
export function useSendConversationMessage({
  threadId,
}: UseSendConversationMessageOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SendConversationMessageBody) =>
      sendConversationMessage(threadId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKeys.messages(threadId),
      })
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKeys.detail(threadId),
      })
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKeys.allLists,
      })
    },
  })
}
