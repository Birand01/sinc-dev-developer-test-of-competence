import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import { updateDealOwner } from '@/features/deals/api/updateDealOwner'
import { dealsQueryKeys } from '@/features/deals/lib/queryKeys'

type UseClaimDealOptions = {
  dealId: string
  /** Signed-in sales rep id (me.id) — backend requires ownerId === actor.id. */
  ownerId: string
}

/**
 * Claim an unassigned deal (PATCH /api/deals/:dealId/owner with ownerId = self).
 *
 * onSuccess invalidates:
 * - deal detail (owner badge, stage/note permissions after refetch)
 * - pipeline lists (Mine / Unassigned filters)
 * - client detail for this deal's client
 */
export function useClaimDeal({ dealId, ownerId }: UseClaimDealOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => updateDealOwner(dealId, { ownerId }),
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
    },
  })
}
