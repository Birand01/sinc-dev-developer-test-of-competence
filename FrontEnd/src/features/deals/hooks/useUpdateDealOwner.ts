import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import { dashboardQueryKeys } from '@/features/dashboard/lib/queryKeys'
import { updateDealOwner } from '@/features/deals/api/updateDealOwner'
import { dealsQueryKeys } from '@/features/deals/lib/queryKeys'
import type { UpdateDealOwnerBody } from '@/features/deals/types'

type UseUpdateDealOwnerOptions = {
  dealId: string
}

/**
 * Reassign deal ownership (PATCH /api/deals/:dealId/owner) — manager use-case.
 *
 * Pass { ownerId: salesUuid } or { ownerId: null } for unassigned pool.
 * onSuccess invalidates deal detail, pipeline lists, client detail, and dashboard aggregates.
 */
export function useUpdateDealOwner({ dealId }: UseUpdateDealOwnerOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateDealOwnerBody) => updateDealOwner(dealId, body),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({
        queryKey: dealsQueryKeys.detail(dealId),
      })
      queryClient.invalidateQueries({
        queryKey: dealsQueryKeys.allLists,
      })
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.detail(deal.clientId),
      })
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.summary,
      })
    },
  })
}
