import { Button } from '@/components/ui/form/button'

type ClientNewChatButtonProps = {
  clientId: string
}

/** Starts a new conversation for the current client — wired to POST /api/conversations later. */
export function ClientNewChatButton({ clientId }: ClientNewChatButtonProps) {
  return (
    <Button type="button" variant="outline" disabled aria-label={`New chat for client ${clientId}`}>
      New Chat
    </Button>
  )
}
