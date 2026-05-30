import { useEffect } from 'react'
import { Handshake } from 'lucide-react'

import { Button } from '@/components/ui/form/button'
import { useClaimDeal } from '@/features/deals/hooks/useClaimDeal'
import { ApiError } from '@/lib/apiClient'

type DealClaimButtonProps = {
  dealId: string
  /** Signed-in sales rep id — PATCH .../owner requires ownerId === actor.id. */
  ownerId: string
  /** Disable while another mutation runs (e.g. stage update). */
  disabled?: boolean
  /** Notifies parent so stage select can disable during claim. */
  onPendingChange?: (isPending: boolean) => void
}

/**
 * Claim an unassigned deal (PATCH /api/deals/:dealId/owner with ownerId = self).
 * Prominent callout — primary action for sales on unassigned deals.
 */
export function DealClaimButton({
  dealId,
  ownerId,
  disabled = false,
  onPendingChange,
}: DealClaimButtonProps) {
  const { mutate, isPending, isError, error } = useClaimDeal({
    dealId,
    ownerId,
  })

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  return (
    <div
      className="rounded-lg border-2 border-primary/40 bg-primary/5 px-4 py-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6"
      role="region"
      aria-label="Claim this deal"
    >
      <div className="min-w-0 space-y-1">
        <p className="text-foreground text-base font-semibold">
          This deal is unassigned
        </p>
        <p className="text-muted-foreground text-sm">
          Take ownership to move it through the pipeline and add internal notes.
        </p>
        {isError ? (
          <p className="text-destructive pt-1 text-sm" role="alert">
            {error instanceof ApiError
              ? error.message
              : 'Could not claim deal'}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        size="lg"
        disabled={disabled || isPending}
        onClick={() => mutate()}
        className="mt-4 h-10 w-full shrink-0 px-6 text-base font-semibold sm:mt-0 sm:w-auto"
        data-icon="inline-start"
      >
        <Handshake aria-hidden />
        {isPending ? 'Taking ownership…' : 'Take this deal'}
      </Button>
    </div>
  )
}
