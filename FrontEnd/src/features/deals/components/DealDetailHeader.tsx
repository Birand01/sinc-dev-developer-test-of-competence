import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/display/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select'
import { DealStage } from '@/features/dashboard/types'
import type { DealStage as DealStageType } from '@/features/dashboard/types'
import { DealClaimButton } from '@/features/deals/components/DealClaimButton'
import { DealLostReasonDialog } from '@/features/deals/components/DealLostReasonDialog'
import { DealReassignOwnerSelect } from '@/features/deals/components/DealReassignOwnerSelect'
import { useUpdateDealStage } from '@/features/deals/hooks/useUpdateDealStage'
import type { DealClientSummary, DealOwnerSummary, DealResponse } from '@/features/deals/types'
import { ApiError } from '@/lib/apiClient'

type DealDetailHeaderProps = {
  dealId: string
  deal: DealResponse
  client: DealClientSummary
  /** From GET /api/deals/:dealId → owner; null when unassigned. */
  owner: DealOwnerSummary | null
  /** Manager always; sales only when deal.ownerId matches signed-in user. */
  canEditStage: boolean
  /** Sales on unassigned deal — show claim button. */
  canClaim: boolean
  /** Manager — show owner reassign Select. */
  canReassignOwner: boolean
  /** Signed-in user id for PATCH .../owner when claiming; undefined until me loads. */
  claimOwnerId?: string
}

// --- Display helpers (wireframe metadata row) ---

function displayValue(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return '—'
  return value
}

function formatStageLabel(stage: DealResponse['stage']): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDealValue(
  amount: number | null,
  currency: string | null,
): string {
  if (amount == null) return '—'
  const code = currency?.trim()
  return code ? `${code} ${amount.toLocaleString()}` : amount.toLocaleString()
}

const STAGE_OPTIONS = Object.values(DealStage)

/**
 * Deal detail header (wireframe top block).
 * Stage select → PATCH /api/deals/:dealId/stage via useUpdateDealStage.
 * Claim → DealClaimButton (sales, unassigned only).
 * Reassign → DealReassignOwnerSelect (manager only).
 */
export function DealDetailHeader({
  dealId,
  deal,
  client,
  owner,
  canEditStage,
  canClaim,
  canReassignOwner,
  claimOwnerId,
}: DealDetailHeaderProps) {
  const [lostDialogOpen, setLostDialogOpen] = useState(false)
  const [isClaimPending, setIsClaimPending] = useState(false)
  const [isReassignPending, setIsReassignPending] = useState(false)
  const ownerLabel = owner?.fullName ?? 'Unassigned'

  const { mutate, isPending, isError, error, reset } = useUpdateDealStage({
    dealId,
  })

  const showClaimAction = canClaim && Boolean(claimOwnerId)
  const ownerMutationBusy = isClaimPending || isReassignPending
  const stageSelectDisabled = !canEditStage || isPending || ownerMutationBusy

  // --- Stage change handlers ---

  function handleStageChange(nextStage: DealStageType) {
    if (nextStage === deal.stage) return
    // Lost requires reason — open dialog instead of PATCH immediately.
    if (nextStage === DealStage.Lost) {
      reset()
      setLostDialogOpen(true)
      return
    }

    mutate({ stage: nextStage })
  }

  function handleConfirmLost(lostReason: string) {
    mutate(
      { stage: DealStage.Lost, lostReason },
      { onSuccess: () => setLostDialogOpen(false) },
    )
  }

  return (
    <>
      <header className="space-y-4 border-b border-border pb-6">
        {/* Title + stage select */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl font-semibold">{deal.title}</h1>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <span className="text-muted-foreground text-xs font-medium">
              Stage
            </span>
            <Select
              value={deal.stage}
              disabled={stageSelectDisabled}
              onValueChange={(value) =>
                handleStageChange(value as DealStageType)
              }
            >
              <SelectTrigger
                className="w-full sm:w-[200px]"
                aria-label="Deal stage"
              >
                <SelectValue>{formatStageLabel(deal.stage)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {formatStageLabel(stage)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isPending ? (
              <p className="text-muted-foreground text-xs" role="status">
                Updating stage…
              </p>
            ) : null}
            {isError && !lostDialogOpen ? (
              <p
                className="text-destructive max-w-[200px] text-right text-xs"
                role="alert"
              >
                {error instanceof ApiError
                  ? error.message
                  : 'Could not update stage'}
              </p>
            ) : null}
          </div>
        </div>

        {showClaimAction && claimOwnerId ? (
          <DealClaimButton
            dealId={dealId}
            ownerId={claimOwnerId}
            disabled={isPending || isReassignPending}
            onPendingChange={setIsClaimPending}
          />
        ) : null}

        {/* Client, owner, value, intake */}
        <dl className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="sr-only">Client</dt>
            <dd>
              <span className="text-foreground font-medium">Client:</span>{' '}
              <Link
                to={`/clients/${client.id}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {client.fullName}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="sr-only">Owner</dt>
            <dd className="flex flex-wrap items-center gap-2">
              <span className="text-foreground font-medium">Owner:</span>
              {canReassignOwner ? (
                <DealReassignOwnerSelect
                  dealId={dealId}
                  ownerId={deal.ownerId}
                  ownerFullName={owner?.fullName}
                  disabled={isPending || isClaimPending}
                  onPendingChange={setIsReassignPending}
                />
              ) : (
                <Badge variant="outline">{ownerLabel}</Badge>
              )}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Value</dt>
            <dd>
              <span className="text-foreground font-medium">Value:</span>{' '}
              {formatDealValue(deal.valueAmount, deal.valueCurrency)}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Intake</dt>
            <dd>
              <span className="text-foreground font-medium">Intake:</span>{' '}
              {displayValue(deal.expectedIntake)}
            </dd>
          </div>
        </dl>
      </header>

      {/* Lost stage — reason required before PATCH */}
      <DealLostReasonDialog
        open={lostDialogOpen}
        onOpenChange={setLostDialogOpen}
        onConfirm={handleConfirmLost}
        isPending={isPending}
        error={lostDialogOpen && isError ? error : null}
      />
    </>
  )
}
