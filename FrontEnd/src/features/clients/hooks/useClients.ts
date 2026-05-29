import { useQuery } from '@tanstack/react-query'

import { getClients } from '@/features/clients/api/getClients'
import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import type { ListClientsParams } from '@/features/clients/types'
import { useAuth } from '@/features/auth/context/AuthContext'

type UseClientsOptions = {
  /** Passed to GET /api/clients as ?q= and ?ownerId=. */
  params?: ListClientsParams
}

/**
 * CRM client list (GET /api/clients).
 *
 * Runs only when Supabase session exists. UI wires search into params later.
 */
export function useClients({ params = {} }: UseClientsOptions = {}) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  return useQuery({
    queryKey: clientsQueryKeys.list(params),
    queryFn: () => getClients(params),
    enabled: isAuthenticated && !isAuthLoading,
  })
}
