import { useQuery } from '@tanstack/react-query'

import { getClientDetail } from '@/features/clients/api/getClientDetail'
import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import { useAuth } from '@/features/auth/context/AuthContext'

/**
 * Rich client detail (GET /api/clients/:clientId).
 *
 * Runs only when Supabase session exists and clientId is set (e.g. from route params).
 */
export function useClientDetail(clientId: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  return useQuery({
    queryKey: clientsQueryKeys.detail(clientId),
    queryFn: () => getClientDetail(clientId),
    enabled: isAuthenticated && !isAuthLoading && Boolean(clientId.trim()),
  })
}
