import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import { createConversation } from '@/features/conversations/api/createConversation'
import { conversationsQueryKeys } from '@/features/conversations/lib/queryKeys'
import type { CreateConversationBody } from '@/features/conversations/types'

/**
 * Start a conversation (POST /api/conversations) and refresh related caches.
 */
export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateConversationBody) => createConversation(body),
    onSuccess: (thread, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.detail(variables.clientId),
      })
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKeys.allLists,
      })
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKeys.detail(thread.id),
      })
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKeys.messages(thread.id),
      })
    },
  })
}
