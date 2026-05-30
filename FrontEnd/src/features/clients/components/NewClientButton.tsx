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
import { useCreateClient } from '@/features/clients/hooks/useCreateClient'
import type { ClientDetailClientResponse } from '@/features/clients/types'
import { ApiError } from '@/lib/apiClient'

/**
 * Staff /clients — create a new lead (POST /api/clients).
 *
 * Sales and manager only (Worker enforces). Button + dialog in one file (NC-3).
 * ClientsPage wires onCreated → navigate to /clients/:id (NC-4).
 */
type NewClientButtonProps = {
  /** After 201 — parent typically navigates to the new client detail page. */
  onCreated?: (client: ClientDetailClientResponse) => void
  disabled?: boolean
}

export function NewClientButton({
  onCreated,
  disabled = false,
}: NewClientButtonProps) {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [targetCountry, setTargetCountry] = useState('')
  const { mutate, isPending, isError, error, reset } = useCreateClient()

  function resetForm() {
    setFullName('')
    setEmail('')
    setPhone('')
    setCountry('')
    setTargetCountry('')
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm()
      reset()
    }
    setOpen(nextOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedFullName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const trimmedCountry = country.trim()
    const trimmedTargetCountry = targetCountry.trim()
    if (!trimmedFullName || !trimmedEmail) return

    mutate(
      {
        fullName: trimmedFullName,
        email: trimmedEmail,
        ...(trimmedPhone ? { phone: trimmedPhone } : {}),
        ...(trimmedCountry ? { country: trimmedCountry } : {}),
        ...(trimmedTargetCountry ? { targetCountry: trimmedTargetCountry } : {}),
      },
      {
        onSuccess: (client) => {
          resetForm()
          setOpen(false)
          onCreated?.(client)
        },
      },
    )
  }

  const canSubmit = Boolean(fullName.trim()) && Boolean(email.trim())
  const isBusy = disabled || isPending

  return (
    <>
      <Button
        type="button"
        aria-label="Create a new client"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        New Client
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>New Client</DialogTitle>
              <DialogDescription>
                Add a new lead to the CRM. Required fields are marked below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="new-client-full-name">Full name</Label>
                <Input
                  id="new-client-full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="e.g. Jane Doe"
                  disabled={isBusy}
                  autoFocus
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-client-email">Email</Label>
                <Input
                  id="new-client-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="lead@example.com"
                  disabled={isBusy}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-client-phone">Phone</Label>
                <Input
                  id="new-client-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+90 555 000 0000"
                  disabled={isBusy}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-client-country">Country</Label>
                  <Input
                    id="new-client-country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    placeholder="Turkey"
                    disabled={isBusy}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-client-target-country">Target country</Label>
                  <Input
                    id="new-client-target-country"
                    value={targetCountry}
                    onChange={(event) => setTargetCountry(event.target.value)}
                    placeholder="Germany"
                    disabled={isBusy}
                  />
                </div>
              </div>
            </div>
            {isError ? (
              <p className="text-destructive text-sm" role="alert">
                {error instanceof ApiError
                  ? error.message
                  : 'Could not create client'}
              </p>
            ) : null}
            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isBusy || !canSubmit}>
                {isPending ? 'Creating…' : 'Create client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
