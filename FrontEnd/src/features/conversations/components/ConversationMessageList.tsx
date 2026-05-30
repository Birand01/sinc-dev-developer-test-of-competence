import { ScrollArea } from '@/components/ui/display/scroll-area'
import { formatMessageSenderLabel } from '@/features/conversations/lib/conversationDisplay'
import type { ConversationMessageResponse } from '@/features/conversations/types'
import { ApiError } from '@/lib/apiClient'

type ConversationMessageListProps = {
  items: ConversationMessageResponse[] | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
}

/** Thread transcript — wireframe lines (Client: / Sales: + body). */
export function ConversationMessageList({
  items,
  isLoading,
  isError,
  error,
}: ConversationMessageListProps) {
  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        Loading messages…
      </p>
    )
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {error instanceof ApiError ? error.message : 'Could not load messages'}
      </p>
    )
  }

  if (!items || items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No messages yet.</p>
    )
  }

  return (
    <ScrollArea className="min-h-0 flex-1 pr-3">
      <ul className="space-y-4">
        {items.map((message) => (
          <li key={message.id} className="text-sm leading-relaxed">
            <span className="font-medium">
              {formatMessageSenderLabel(message.senderType)}:
            </span>{' '}
            <span className="text-foreground whitespace-pre-wrap">
              {message.body}
            </span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
