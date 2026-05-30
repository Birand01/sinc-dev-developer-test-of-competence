import { useQuery } from '@tanstack/react-query'

import { getConversationThread } from '@/features/conversations/api/getConversationThread'
import { conversationsQueryKeys } from '@/features/conversations/lib/queryKeys'
import { useAuth } from '@/features/auth/context/AuthContext'

/**
 * Single thread header (GET /api/conversations/:threadId) via React Query.
 *
 * Runs only when authenticated and threadId is set (e.g. inbox selection).
 * ConversationThreadPanel reads data / isLoading / isError; it does not call getConversationThread directly.
 */
export function useConversationThread(threadId: string | null | undefined) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const trimmedThreadId = threadId?.trim() ?? ''

  return useQuery({
    queryKey: conversationsQueryKeys.detail(trimmedThreadId),
    queryFn: () => getConversationThread(trimmedThreadId),
    enabled: isAuthenticated && !isAuthLoading && Boolean(trimmedThreadId),
  })
}
