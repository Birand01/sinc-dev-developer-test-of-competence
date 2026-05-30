import { useState } from 'react'

import { Badge } from '@/components/ui/display/badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/display/card'
import { ConversationClaimButton } from '@/features/conversations/components/ConversationClaimButton'
import { ConversationMessageList } from '@/features/conversations/components/ConversationMessageList'
import { ConversationReassignSelect } from '@/features/conversations/components/ConversationReassignSelect'
import { ConversationReplyBox } from '@/features/conversations/components/ConversationReplyBox'
import {
  formatConversationAssigneeLabel,
  formatConversationStatusLabel,
} from '@/features/conversations/lib/conversationDisplay'
import type {
  ConversationMessageResponse,
  ConversationThreadResponse,
} from '@/features/conversations/types'
import { ApiError } from '@/lib/apiClient'

type ConversationThreadPanelProps = {
  threadId: string | null
  thread: ConversationThreadResponse | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  messages: ConversationMessageResponse[] | undefined
  isMessagesLoading: boolean
  isMessagesError: boolean
  messagesError: unknown
  /** Sales on unassigned thread — show Assign to me (matches canAssignThread). */
  canClaim: boolean
  /** Manager — inline reassign Select (matches canAssignThread for managers). */
  canReassign: boolean
  /** Signed-in user id for PATCH .../assign when claiming; undefined until me loads. */
  claimAssigneeId?: string
  /** Optional map from profiles.id → full name (dashboard dealsByOwner). */
  assigneeNameById?: Record<string, string>
}

/** Staff inbox thread pane — header, claim, transcript, and reply composer. */
export function ConversationThreadPanel({
  threadId,
  thread,
  isLoading,
  isError,
  error,
  messages,
  isMessagesLoading,
  isMessagesError,
  messagesError,
  canClaim,
  canReassign,
  claimAssigneeId,
  assigneeNameById,
}: ConversationThreadPanelProps) {
  const [isClaimPending, setIsClaimPending] = useState(false)
  const [isReassignPending, setIsReassignPending] = useState(false)

  if (!threadId) {
    return (
      <Card className="flex min-h-[420px] flex-col">
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">Select a conversation.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="flex min-h-[420px] flex-col">
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm" role="status">
            Loading thread…
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
              : 'Could not load conversation'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const ownerLabel = formatConversationAssigneeLabel(
    thread.assignedTo,
    assigneeNameById,
  )
  const showClaimAction = canClaim && Boolean(claimAssigneeId)
  const assignMutationBusy = isClaimPending || isReassignPending
  const assigneeFullName =
    thread.assignedTo != null
      ? assigneeNameById?.[thread.assignedTo]
      : undefined

  return (
    <Card className="flex min-h-[420px] flex-col">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-tight">{thread.subject}</h2>
          <Badge variant="outline" className="shrink-0">
            {formatConversationStatusLabel(thread.status)}
          </Badge>
        </div>
        <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <span className="text-foreground font-medium">Owner:</span>
          {canReassign ? (
            <ConversationReassignSelect
              threadId={threadId}
              assignedTo={thread.assignedTo}
              assigneeFullName={assigneeFullName}
              disabled={isClaimPending}
              onPendingChange={setIsReassignPending}
            />
          ) : (
            <Badge variant="outline">{ownerLabel}</Badge>
          )}
        </p>
        {showClaimAction && claimAssigneeId ? (
          <ConversationClaimButton
            threadId={threadId}
            assigneeId={claimAssigneeId}
            disabled={isReassignPending}
            onPendingChange={setIsClaimPending}
          />
        ) : null}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 border-t pt-4">
        <ConversationMessageList
          items={messages}
          isLoading={isMessagesLoading}
          isError={isMessagesError}
          error={messagesError}
        />
        <div className="mt-auto shrink-0 border-t pt-4">
          <ConversationReplyBox
            threadId={threadId}
            disabled={assignMutationBusy}
          />
        </div>
      </CardContent>
    </Card>
  )
}
