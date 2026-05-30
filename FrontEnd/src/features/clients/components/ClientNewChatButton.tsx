import { useState } from 'react'

import { ClientNewChatDialog } from '@/features/clients/components/ClientNewChatDialog'
import { Button } from '@/components/ui/form/button'

type ClientNewChatButtonProps = {
  clientId: string
}

/** Opens the new-chat dialog for the current client. */
export function ClientNewChatButton({ clientId }: ClientNewChatButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        aria-label={`New chat for client ${clientId}`}
        onClick={() => setOpen(true)}
      >
        New Chat
      </Button>
      <ClientNewChatDialog
        clientId={clientId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
