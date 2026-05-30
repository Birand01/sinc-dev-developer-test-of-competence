import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createDealNote } from '@/features/deals/api/createDealNote'
import { dealsQueryKeys } from '@/features/deals/lib/queryKeys'
import type { CreateDealNoteBody } from '@/features/deals/types'

type UseCreateDealNoteOptions = {
  dealId: string
}

/**
 * Add a note to a deal (POST /api/deals/:dealId/notes) and refresh deal detail cache.
 *
 * onSuccess invalidates deal detail so DealNotesCard refetches the notes list.
 */
export function useCreateDealNote({ dealId }: UseCreateDealNoteOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateDealNoteBody) => createDealNote(dealId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dealsQueryKeys.detail(dealId),
      })
    },
  })
}
