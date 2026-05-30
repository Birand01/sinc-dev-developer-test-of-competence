import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createClient } from '@/features/clients/api/createClient'
import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import type { CreateClientBody } from '@/features/clients/types'

/**
 * Create a client / lead (POST /api/clients) and refresh the clients list cache.
 *
 * invalidateQueries marks stale — useClients refetches so /clients shows the new row.
 * Detail cache for the new id is populated when the user navigates to /clients/:clientId.
 */
export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateClientBody) => createClient(body),
    onSuccess: (client) => {
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.allLists,
      })
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.detail(client.id),
      })
    },
  })
}
