import { useEffect } from 'react'
import { Handshake } from 'lucide-react'

import { Button } from '@/components/ui/form/button'
import { useAssignConversation } from '@/features/conversations/hooks/useAssignConversation'
import { ApiError } from '@/lib/apiClient'

type ConversationClaimButtonProps = {
  threadId: string
  /** Signed-in sales rep id (me.id) — backend requires assignedTo === actor.id for sales. */
  assigneeId: string
  /** Disable while another mutation runs (e.g. send reply). */
  disabled?: boolean
  /** Notifies parent so sibling controls can disable during claim. */
  onPendingChange?: (isPending: boolean) => void
}

/**
 * Claim an unassigned conversation (PATCH /api/conversations/:threadId/assign).
 *
 * Sales-only UI — parent must gate visibility (role + thread.assignedTo === null).
 * Sends { assignedTo: assigneeId }; on success useAssignConversation refreshes inbox caches.
 */
export function ConversationClaimButton({
  threadId,
  assigneeId,
  disabled = false,
  onPendingChange,
}: ConversationClaimButtonProps) {
  const { mutate, isPending, isError, error } = useAssignConversation({
    threadId,
  })

  // Let parent disable reassign / reply while claim is in flight.
  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  function handleClaim() {
    mutate({ assignedTo: assigneeId })
  }

  return (
    <div
      className="rounded-lg border-2 border-primary/40 bg-primary/5 px-4 py-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6"
      role="region"
      aria-label="Claim this conversation"
    >
      <div className="min-w-0 space-y-1">
        <p className="text-foreground text-base font-semibold">
          This conversation is unassigned
        </p>
        <p className="text-muted-foreground text-sm">
          Assign it to yourself to own replies and keep it in your Mine inbox.
        </p>
        {isError ? (
          <p className="text-destructive pt-1 text-sm" role="alert">
            {error instanceof ApiError
              ? error.message
              : 'Could not assign conversation'}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        size="lg"
        disabled={disabled || isPending}
        onClick={handleClaim}
        className="mt-4 h-10 w-full shrink-0 px-6 text-base font-semibold sm:mt-0 sm:w-auto"
        data-icon="inline-start"
      >
        <Handshake aria-hidden />
        {isPending ? 'Assigning…' : 'Assign to me'}
      </Button>
    </div>
  )
}
