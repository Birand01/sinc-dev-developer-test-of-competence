import { useMemo, useState } from 'react'

import { useMe } from '@/features/auth/hooks/useMe'
import { AppRole } from '@/features/auth/types'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { ConversationQueueList } from '@/features/conversations/components/ConversationQueueList'
import { ConversationThreadPanel } from '@/features/conversations/components/ConversationThreadPanel'
import { ConversationsFilterBar } from '@/features/conversations/components/ConversationsFilterBar'
import { useConversations } from '@/features/conversations/hooks/useConversations'
import { useConversationMessages } from '@/features/conversations/hooks/useConversationMessages'
import { useConversationThread } from '@/features/conversations/hooks/useConversationThread'
import {
  conversationAssigneeFilterDefault,
  filterThreadsByAssignee,
  type ConversationAssigneeFilter,
} from '@/features/conversations/lib/conversationFilters'
import type { ConversationThreadResponse } from '@/features/conversations/types'
import { ApiError } from '@/lib/apiClient'

/** Staff inbox — queue, filters, thread detail, messages, reply, claim, and reassign. */
export function ConversationsPage() {
  const [assigneeFilter, setAssigneeFilter] =
    useState<ConversationAssigneeFilter>(conversationAssigneeFilterDefault)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const { data: me } = useMe()
  const { data: dashboard } = useDashboard()
  const { data: threads, isLoading, isError, error } = useConversations()
  const {
    data: selectedThread,
    isLoading: isThreadLoading,
    isError: isThreadError,
    error: threadError,
  } = useConversationThread(selectedThreadId)
  const {
    data: messages,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
  } = useConversationMessages(selectedThreadId)

  const assigneeNameById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const item of dashboard?.dealsByOwner ?? []) {
      if (item.ownerId && item.ownerFullName) {
        map[item.ownerId] = item.ownerFullName
      }
    }
    return map
  }, [dashboard])

  const filteredThreads = useMemo(() => {
    if (!threads) return undefined
    return filterThreadsByAssignee(threads, assigneeFilter, me?.id)
  }, [threads, assigneeFilter, me?.id])

  const handleThreadSelect = (thread: ConversationThreadResponse) => {
    setSelectedThreadId(thread.id)
  }

  // Matches backend canAssignThread — sales may claim unassigned threads only.
  const canClaim =
    selectedThread != null &&
    me?.role === AppRole.Sales &&
    selectedThread.assignedTo === null

  const canReassign =
    selectedThread != null && me?.role === AppRole.Manager

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <ConversationsFilterBar
          value={assigneeFilter}
          onValueChange={setAssigneeFilter}
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm" role="status">
          Loading conversations…
        </p>
      ) : null}

      {isError ? (
        <p className="text-destructive text-sm" role="alert">
          {error instanceof ApiError ? error.message : 'Could not load conversations'}
        </p>
      ) : null}

      {!isLoading && !isError && filteredThreads ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <ConversationQueueList
            items={filteredThreads}
            assigneeNameById={assigneeNameById}
            selectedThreadId={selectedThreadId}
            onThreadSelect={handleThreadSelect}
          />

          <ConversationThreadPanel
            threadId={selectedThreadId}
            thread={selectedThread}
            isLoading={isThreadLoading}
            isError={isThreadError}
            error={threadError}
            messages={messages}
            isMessagesLoading={isMessagesLoading}
            isMessagesError={isMessagesError}
            messagesError={messagesError}
            canClaim={canClaim}
            canReassign={canReassign}
            claimAssigneeId={me?.id}
            assigneeNameById={assigneeNameById}
          />
        </div>
      ) : null}
    </div>
  )
}
