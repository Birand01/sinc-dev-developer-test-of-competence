import { useState } from 'react'

import { ClientNewDealDialog } from '@/features/clients/components/ClientNewDealDialog'
import { Button } from '@/components/ui/form/button'

type ClientNewDealButtonProps = {
  clientId: string
}

/** Opens the new-deal dialog for the current client. */
export function ClientNewDealButton({ clientId }: ClientNewDealButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        aria-label={`New deal for client ${clientId}`}
        onClick={() => setOpen(true)}
      >
        New Deal
      </Button>
      <ClientNewDealDialog
        clientId={clientId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
