import { Badge } from '@/components/ui/display/badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/display/card'
import { ConversationMessageList } from '@/features/conversations/components/ConversationMessageList'
import { ConversationReplyBox } from '@/features/conversations/components/ConversationReplyBox'
import { formatConversationStatusLabel } from '@/features/conversations/lib/conversationDisplay'
import type {
  ConversationMessageResponse,
  ConversationThreadResponse,
} from '@/features/conversations/types'
import { ApiError } from '@/lib/apiClient'

type ClientChatThreadPanelProps = {
  threadId: string | null
  thread: ConversationThreadResponse | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  messages: ConversationMessageResponse[] | undefined
  isMessagesLoading: boolean
  isMessagesError: boolean
  messagesError: unknown
}

/** Client portal thread pane — subject, transcript, and reply (no staff assignee controls). */
export function ClientChatThreadPanel({
  threadId,
  thread,
  isLoading,
  isError,
  error,
  messages,
  isMessagesLoading,
  isMessagesError,
  messagesError,
}: ClientChatThreadPanelProps) {
  if (!threadId) {
    return (
      <Card className="flex min-h-[420px] flex-col">
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Select a chat to view messages.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="flex min-h-[420px] flex-col">
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm" role="status">
            Loading chat…
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isError || !thread) {
    return (
      <Card className="flex min-h-[420px] flex-col">
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-destructive text-sm" role="alert">
            {error instanceof ApiError
              ? error.message
              : 'Could not load chat'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex min-h-[420px] flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-tight">{thread.subject}</h2>
          <Badge variant="outline" className="shrink-0">
            {formatConversationStatusLabel(thread.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 border-t pt-4">
        <ConversationMessageList
          items={messages}
          isLoading={isMessagesLoading}
          isError={isMessagesError}
          error={messagesError}
        />
        <div className="mt-auto shrink-0 border-t pt-4">
          <ConversationReplyBox threadId={threadId} />
        </div>
      </CardContent>
    </Card>
  )
}
