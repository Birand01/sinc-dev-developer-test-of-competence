import { useQuery } from '@tanstack/react-query'

import { getDeals } from '@/features/deals/api/getDeals'
import { dealsQueryKeys } from '@/features/deals/lib/queryKeys'
import type { ListDealsParams } from '@/features/deals/types'
import { useAuth } from '@/features/auth/context/AuthContext'

type UseDealsOptions = {
  /** Passed to GET /api/deals as ?stage= ?ownerId= ?clientId= ?q=. */
  params?: ListDealsParams
}

/**
 * Pipeline deal list (GET /api/deals) via React Query.
 *
 * - queryKey: dealsQueryKeys.list(params) — cache box for this filter set
 * - queryFn: getDeals(params) — fills the box from the Worker
 * - enabled: wait for auth before calling the API (avoids 401 while session loads)
 *
 * PipelinePage reads data / isLoading / isError; it does not call getDeals directly.
 */
export function useDeals({ params = {} }: UseDealsOptions = {}) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  return useQuery({
    queryKey: dealsQueryKeys.list(params),
    queryFn: () => getDeals(params),
    enabled: isAuthenticated && !isAuthLoading,
  })
}
