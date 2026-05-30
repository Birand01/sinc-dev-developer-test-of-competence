import { useState } from 'react'

import { ClientChatList } from '@/features/client/components/ClientChatList'
import { ClientChatThreadPanel } from '@/features/client/components/ClientChatThreadPanel'
import { ClientNewChatButton } from '@/features/client/components/ClientNewChatButton'
import { useClients } from '@/features/clients/hooks/useClients'
import { useConversations } from '@/features/conversations/hooks/useConversations'
import { useConversationMessages } from '@/features/conversations/hooks/useConversationMessages'
import { useConversationThread } from '@/features/conversations/hooks/useConversationThread'
import type { ConversationThreadResponse } from '@/features/conversations/types'
import { ApiError } from '@/lib/apiClient'

/** Client portal — thread list, new chat, transcript, and reply (RLS-scoped API). */
export function ClientChatsPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const { data: clients, isLoading: isClientsLoading } = useClients()
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

  const clientId = clients?.[0]?.id

  const handleThreadSelect = (thread: ConversationThreadResponse) => {
    setSelectedThreadId(thread.id)
  }

  const handleChatCreated = (thread: ConversationThreadResponse) => {
    setSelectedThreadId(thread.id)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Chats</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Ask your advisor questions about your application.
          </p>
        </div>
        <ClientNewChatButton
          clientId={clientId ?? ''}
          disabled={isClientsLoading || !clientId}
          onCreated={handleChatCreated}
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

      {!isLoading && !isError && threads ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <ClientChatList
            items={threads}
            selectedThreadId={selectedThreadId}
            onThreadSelect={handleThreadSelect}
          />

          <ClientChatThreadPanel
            threadId={selectedThreadId}
            thread={selectedThread}
            isLoading={isThreadLoading}
            isError={isThreadError}
            error={threadError}
            messages={messages}
            isMessagesLoading={isMessagesLoading}
            isMessagesError={isMessagesError}
            messagesError={messagesError}
          />
        </div>
      ) : null}
    </div>
  )
}
