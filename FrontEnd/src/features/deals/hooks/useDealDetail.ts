import { useQuery } from '@tanstack/react-query'

import { getDealDetail } from '@/features/deals/api/getDealDetail'
import { dealsQueryKeys } from '@/features/deals/lib/queryKeys'
import { useAuth } from '@/features/auth/context/AuthContext'

/**
 * Rich deal detail (GET /api/deals/:dealId) via React Query.
 *
 * - queryKey: dealsQueryKeys.detail(dealId)
 * - queryFn: getDealDetail(dealId)
 * - enabled: wait for auth and a non-empty dealId (e.g. from /deals/:dealId route)
 *
 * DealDetailPage reads data / isLoading / isError; it does not call getDealDetail directly.
 */
export function useDealDetail(dealId: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  return useQuery({
    queryKey: dealsQueryKeys.detail(dealId),
    queryFn: () => getDealDetail(dealId),
    enabled: isAuthenticated && !isAuthLoading && Boolean(dealId.trim()),
  })
}
