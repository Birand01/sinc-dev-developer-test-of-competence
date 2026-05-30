import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/form/button'
import { Label } from '@/components/ui/form/label'
import { Textarea } from '@/components/ui/form/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlay/dialog'
import { ApiError } from '@/lib/apiClient'

type DealLostReasonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Parent calls useUpdateDealStage with stage=lost + lostReason. */
  onConfirm: (lostReason: string) => void
  isPending?: boolean
  error?: Error | null
}

/**
 * Modal for PATCH /api/deals/:dealId/stage when stage = lost.
 * Opened from DealDetailHeader — backend rejects lost without lostReason.
 */
export function DealLostReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  error = null,
}: DealLostReasonDialogProps) {
  const [lostReason, setLostReason] = useState('')

  function handleOpenChange(nextOpen: boolean) {
    // Reset form on close; stage Select reverts visually until PATCH succeeds.
    if (!nextOpen) {
      setLostReason('')
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = lostReason.trim()
    if (!trimmed) return
    onConfirm(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mark deal as lost</DialogTitle>
            <DialogDescription>
              A short reason is required when moving a deal to the lost stage.
            </DialogDescription>
          </DialogHeader>

          {/* Reason input */}
          <div className="grid gap-2 py-2">
            <Label htmlFor="deal-lost-reason">Lost reason</Label>
            <Textarea
              id="deal-lost-reason"
              value={lostReason}
              onChange={(event) => setLostReason(event.target.value)}
              placeholder="e.g. Chose another agency"
              disabled={isPending}
              autoFocus
              rows={3}
            />
          </div>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error instanceof ApiError
                ? error.message
                : 'Could not update stage'}
            </p>
          ) : null}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !lostReason.trim()}>
              {isPending ? 'Saving…' : 'Confirm lost'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
