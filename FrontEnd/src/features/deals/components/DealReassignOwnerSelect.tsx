import { useEffect, useMemo } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select'
import { useSalesRepOptions } from '@/features/deals/hooks/useSalesRepOptions'
import { useUpdateDealOwner } from '@/features/deals/hooks/useUpdateDealOwner'
import { ApiError } from '@/lib/apiClient'

/** Select value when deal returns to the unassigned pool (PATCH ownerId: null). */
export const dealOwnerReassignUnassigned = 'unassigned'

type DealReassignOwnerSelectProps = {
  dealId: string
  /** Current deal.ownerId; null when unassigned. */
  ownerId: string | null
  /** Display name from GET detail owner; used when rep is not in dashboard list. */
  ownerFullName?: string | null
  /** Disable while stage update or claim runs. */
  disabled?: boolean
  /** Notifies parent so stage select can disable during reassign. */
  onPendingChange?: (isPending: boolean) => void
}

/**
 * Manager-only owner reassign control (PATCH /api/deals/:dealId/owner).
 * Inline Select — Unassigned or a sales rep from dashboard dealsByOwner.
 */
export function DealReassignOwnerSelect({
  dealId,
  ownerId,
  ownerFullName,
  disabled = false,
  onPendingChange,
}: DealReassignOwnerSelectProps) {
  const { options, isLoading: isLoadingOptions } = useSalesRepOptions()
  const { mutate, isPending, isError, error } = useUpdateDealOwner({ dealId })

  const selectValue = ownerId ?? dealOwnerReassignUnassigned

  const repOptions = useMemo(() => {
    if (ownerId && !options.some((option) => option.id === ownerId)) {
      return [
        { id: ownerId, label: ownerFullName?.trim() || 'Current owner' },
        ...options,
      ]
    }
    return options
  }, [options, ownerId, ownerFullName])

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  function handleOwnerChange(nextValue: string) {
    if (nextValue === selectValue) return

    if (nextValue === dealOwnerReassignUnassigned) {
      mutate({ ownerId: null })
      return
    }

    mutate({ ownerId: nextValue })
  }

  const selectDisabled = disabled || isPending || isLoadingOptions

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <Select
        value={selectValue}
        disabled={selectDisabled}
        onValueChange={handleOwnerChange}
      >
        <SelectTrigger
          className="h-8 min-w-[172px] border-foreground/30 bg-background font-medium text-foreground shadow-sm hover:border-foreground/50 hover:bg-muted/40 data-placeholder:text-muted-foreground"
          aria-label="Reassign deal owner"
        >
          <SelectValue placeholder="Assign owner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={dealOwnerReassignUnassigned}>Unassigned</SelectItem>
          {repOptions.map((rep) => (
            <SelectItem key={rep.id} value={rep.id}>
              {rep.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending ? (
        <span className="text-muted-foreground text-xs" role="status">
          Updating…
        </span>
      ) : null}
      {isError ? (
        <span className="text-destructive text-xs" role="alert">
          {error instanceof ApiError
            ? error.message
            : 'Could not update owner'}
        </span>
      ) : null}
    </span>
  )
}
