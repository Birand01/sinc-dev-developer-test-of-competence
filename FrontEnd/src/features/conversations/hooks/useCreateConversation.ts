import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import { createConversation } from '@/features/conversations/api/createConversation'
import type { CreateConversationBody } from '@/features/conversations/types'

/**
 * Start a conversation (POST /api/conversations) and refresh client detail cache.
 */
export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateConversationBody) => createConversation(body),
    onSuccess: (_thread, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.detail(variables.clientId),
      })
    },
  })
}
