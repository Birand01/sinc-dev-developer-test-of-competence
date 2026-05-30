import { useQuery } from '@tanstack/react-query'

import { listConversationMessages } from '@/features/conversations/api/listConversationMessages'
import { conversationsQueryKeys } from '@/features/conversations/lib/queryKeys'
import { useAuth } from '@/features/auth/context/AuthContext'

/**
 * Message transcript (GET /api/conversations/:threadId/messages) via React Query.
 *
 * Runs only when authenticated and threadId is set (e.g. inbox selection).
 */
export function useConversationMessages(threadId: string | null | undefined) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const trimmedThreadId = threadId?.trim() ?? ''

  return useQuery({
    queryKey: conversationsQueryKeys.messages(trimmedThreadId),
    queryFn: () => listConversationMessages(trimmedThreadId),
    enabled:
      isAuthenticated && !isAuthLoading && Boolean(trimmedThreadId),
  })
}
