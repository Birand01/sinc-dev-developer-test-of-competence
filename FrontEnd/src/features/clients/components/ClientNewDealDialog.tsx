import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/form/button'
import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlay/dialog'
import { AppRole } from '@/features/auth/types'
import { useMe } from '@/features/auth/hooks/useMe'
import { useCreateDeal } from '@/features/deals/hooks/useCreateDeal'
import { ApiError } from '@/lib/apiClient'

type ClientNewDealDialogProps = {
  clientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Modal form to create a deal for the current client (POST /api/deals). */
export function ClientNewDealDialog({
  clientId,
  open,
  onOpenChange,
}: ClientNewDealDialogProps) {
  const [title, setTitle] = useState('')
  const { data: me } = useMe()
  const { mutate, isPending, isError, error, reset } = useCreateDeal()

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setTitle('')
      reset()
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    mutate(
      {
        clientId,
        title: trimmedTitle,
        // Backend also defaults sales → self; explicit for clarity in network tab.
        ...(me?.role === AppRole.Sales ? { ownerId: me.id } : {}),
      },
      {
        onSuccess: () => {
          setTitle('')
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Deal</DialogTitle>
            <DialogDescription>
              Add a pipeline deal for this client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="deal-title">Title</Label>
            <Input
              id="deal-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Canada business program"
              disabled={isPending}
              autoFocus
            />
          </div>
          {isError ? (
            <p className="text-destructive text-sm" role="alert">
              {error instanceof ApiError
                ? error.message
                : 'Could not create deal'}
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
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? 'Creating…' : 'Create deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
