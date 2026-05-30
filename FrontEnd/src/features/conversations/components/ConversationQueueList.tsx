import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import { ScrollArea } from '@/components/ui/display/scroll-area'
import { formatConversationAssigneeLabel } from '@/features/conversations/lib/conversationDisplay'
import type { ConversationThreadResponse } from '@/features/conversations/types'
import { cn } from '@/lib/utils'

type ConversationQueueListProps = {
  items: ConversationThreadResponse[]
  /** Optional map from profiles.id → full name (dashboard dealsByOwner). */
  assigneeNameById?: Record<string, string>
  selectedThreadId?: string | null
  onThreadSelect?: (thread: ConversationThreadResponse) => void
}

/** Staff inbox queue — wireframe left column (subject + assignee per row). */
export function ConversationQueueList({
  items,
  assigneeNameById,
  selectedThreadId,
  onThreadSelect,
}: ConversationQueueListProps) {
  return (
    <Card className="flex min-h-[420px] flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Queue</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No conversations match this filter.
          </p>
        ) : (
          <ScrollArea className="min-h-0 flex-1 pr-3">
            <ul className="divide-y divide-border">
              {items.map((thread) => {
                const isSelected = selectedThreadId === thread.id
                const assigneeLabel = formatConversationAssigneeLabel(
                  thread.assignedTo,
                  assigneeNameById,
                )

                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => onThreadSelect?.(thread)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 py-3 text-left transition-colors',
                        'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isSelected && 'bg-muted',
                      )}
                    >
                      <span className="truncate text-sm font-medium">
                        {thread.subject}
                      </span>
                      <span className="text-muted-foreground shrink-0 text-sm">
                        {assigneeLabel}
                      </span>
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
