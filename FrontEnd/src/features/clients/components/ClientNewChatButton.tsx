import { useState } from 'react'

import { StartConversationDialog } from '@/components/common/StartConversationDialog'
import { Button } from '@/components/ui/form/button'

type ClientNewChatButtonProps = {
  clientId: string
}

/** Staff Client detail — opens shared StartConversationDialog (variant staff). */
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
      <StartConversationDialog
        clientId={clientId}
        open={open}
        onOpenChange={setOpen}
        variant="staff"
      />
    </>
  )
}
