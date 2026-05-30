import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import { updateDealStage } from '@/features/deals/api/updateDealStage'
import { dealsQueryKeys } from '@/features/deals/lib/queryKeys'
import type { UpdateDealStageBody } from '@/features/deals/types'

type UseUpdateDealStageOptions = {
  dealId: string
}

/**
 * Update deal stage (PATCH /api/deals/:dealId/stage) and refresh related caches.
 *
 * onSuccess invalidates:
 * - deal detail (header stage, stageHistory after refetch)
 * - pipeline lists (kanban column moves)
 * - client detail for this deal's client (deals card stage badge)
 */
export function useUpdateDealStage({ dealId }: UseUpdateDealStageOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateDealStageBody) => updateDealStage(dealId, body),
    onSuccess: (deal) => {
      // Detail: header stage, stageHistory, lostReason on refetch.
      queryClient.invalidateQueries({
        queryKey: dealsQueryKeys.detail(dealId),
      })
      // Pipeline: deal may move to another column.
      queryClient.invalidateQueries({
        queryKey: dealsQueryKeys.allLists,
      })
      // Client detail deals card stage badge.
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.detail(deal.clientId),
      })
    },
  })
}
