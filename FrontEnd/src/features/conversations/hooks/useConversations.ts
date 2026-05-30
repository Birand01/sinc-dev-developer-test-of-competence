import { useQuery } from '@tanstack/react-query'

import { listConversations } from '@/features/conversations/api/listConversations'
import { conversationsQueryKeys } from '@/features/conversations/lib/queryKeys'
import { useAuth } from '@/features/auth/context/AuthContext'

/**
 * Inbox thread list (GET /api/conversations) via React Query.
 *
 * Assignee scope (Unassigned / Mine / All) is filtered in the page layer —
 * this hook loads the full RLS-visible list once per cache entry.
 */
export function useConversations() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  return useQuery({
    queryKey: conversationsQueryKeys.list(),
    queryFn: () => listConversations(),
    enabled: isAuthenticated && !isAuthLoading,
  })
}
