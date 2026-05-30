import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import { createDeal } from '@/features/deals/api/createDeal'
import { dealsQueryKeys } from '@/features/deals/lib/queryKeys'
import type { CreateDealBody } from '@/features/deals/types'

/**
 * Create a deal (POST /api/deals) and mark related caches stale so UI refetches.
 *
 * invalidateQueries does not fetch — it tells React Query old cache entries are outdated.
 * - client detail: deals card + activity on /clients/:clientId
 * - client allLists: activeDealTitle on /clients list
 * - deals allLists: any Pipeline list(params) cache (prefix match)
 */
export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateDealBody) => createDeal(body),
    onSuccess: (_deal, variables) => {
      // Client detail: deals card + activity.
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.detail(variables.clientId),
      })
      // Clients list: activeDealTitle column.
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.allLists,
      })
      // Pipeline: new deal appears in kanban.
      queryClient.invalidateQueries({
        queryKey: dealsQueryKeys.allLists,
      })
    },
  })
}
