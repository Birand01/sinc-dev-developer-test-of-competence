import { Badge } from '@/components/ui/display/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import { ScrollArea } from '@/components/ui/display/scroll-area'
import { formatConversationStatusLabel } from '@/features/conversations/lib/conversationDisplay'
import type { ConversationThreadResponse } from '@/features/conversations/types'
import { cn } from '@/lib/utils'

type ClientChatListProps = {
  items: ConversationThreadResponse[]
  selectedThreadId?: string | null
  onThreadSelect?: (thread: ConversationThreadResponse) => void
}

/** Compact relative time for lastMessageAt — kept local until a shared date helper exists. */
function formatLastMessageAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}

/** Client portal thread list — subject, status, last activity (no staff assignee column). */
export function ClientChatList({
  items,
  selectedThreadId,
  onThreadSelect,
}: ClientChatListProps) {
  return (
    <Card className="flex min-h-[320px] flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your chats</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No conversations yet.</p>
        ) : (
          <ScrollArea className="min-h-0 flex-1 pr-3">
            <ul className="divide-y divide-border">
              {items.map((thread) => {
                const isSelected = selectedThreadId === thread.id
                const lastActivity = formatLastMessageAt(thread.lastMessageAt)

                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => onThreadSelect?.(thread)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={cn(
                        'flex w-full flex-col gap-1 py-3 text-left transition-colors',
                        'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isSelected && 'bg-muted',
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium">
                          {thread.subject}
                        </span>
                        <Badge variant="outline" className="shrink-0">
                          {formatConversationStatusLabel(thread.status)}
                        </Badge>
                      </span>
                      {lastActivity ? (
                        <span className="text-muted-foreground text-xs">
                          Last message · {lastActivity}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
