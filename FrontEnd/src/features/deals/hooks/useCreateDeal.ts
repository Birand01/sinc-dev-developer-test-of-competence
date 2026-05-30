import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import { createDeal } from '@/features/deals/api/createDeal'
import type { CreateDealBody } from '@/features/deals/types'

/**
 * Create a deal (POST /api/deals) and refresh client detail + list caches.
 */
export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateDealBody) => createDeal(body),
    onSuccess: (_deal, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.detail(variables.clientId),
      })
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.allLists,
      })
    },
  })
}
