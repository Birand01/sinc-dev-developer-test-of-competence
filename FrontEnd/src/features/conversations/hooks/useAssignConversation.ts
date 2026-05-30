import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clientsQueryKeys } from '@/features/clients/lib/queryKeys'
import { dashboardQueryKeys } from '@/features/dashboard/lib/queryKeys'
import { assignConversation } from '@/features/conversations/api/assignConversation'
import { conversationsQueryKeys } from '@/features/conversations/lib/queryKeys'
import type { AssignConversationBody } from '@/features/conversations/types'

type UseAssignConversationOptions = {
  threadId: string
}

/**
 * Claim or reassign a thread (PATCH /api/conversations/:threadId/assign).
 *
 * Sales: { assignedTo: me.id } on unassigned threads only.
 * Manager: { assignedTo: salesRepId } or { assignedTo: null } to unassign.
 *
 * onSuccess invalidates thread detail, inbox list, client detail, and dashboard KPIs.
 */
export function useAssignConversation({ threadId }: UseAssignConversationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AssignConversationBody) =>
      assignConversation(threadId, body),
    onSuccess: (thread) => {
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKeys.detail(threadId),
      })
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKeys.allLists,
      })
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.detail(thread.clientId),
      })
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.summary,
      })
    },
  })
}
