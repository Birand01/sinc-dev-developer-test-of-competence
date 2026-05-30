import { useState } from 'react'

import { StartConversationDialog } from '@/components/common/StartConversationDialog'
import { Button } from '@/components/ui/form/button'
import type { ConversationThreadResponse } from '@/features/conversations/types'

/**
 * Client portal My Chats — thin wrapper around StartConversationDialog (variant portal).
 *
 * clientId from GET /api/clients (RLS). onCreated lets ClientChatsPage select the new thread.
 */
type ClientNewChatButtonProps = {
  clientId: string
  onCreated?: (thread: ConversationThreadResponse) => void
  disabled?: boolean
}

export function ClientNewChatButton({
  clientId,
  onCreated,
  disabled = false,
}: ClientNewChatButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        aria-label="Start a new chat with your advisor"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        New Chat
      </Button>
      <StartConversationDialog
        clientId={clientId}
        open={open}
        onOpenChange={setOpen}
        variant="portal"
        onSuccess={onCreated}
      />
    </>
  )
}
