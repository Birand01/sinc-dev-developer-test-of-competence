import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/display/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import { formatConversationStatusLabel } from '@/features/conversations/lib/conversationDisplay'
import type { ConversationThreadResponse } from '@/features/clients/types'
import { cn } from '@/lib/utils'

type ClientConversationsCardProps = {
  items: ConversationThreadResponse[]
}

/** Conversation threads for one client — row links to staff inbox (CL-2 selects thread). */
export function ClientConversationsCard({ items }: ClientConversationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No conversations yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((thread) => (
              <li key={thread.id}>
                <Link
                  to="/conversations"
                  state={{ threadId: thread.id }}
                  className={cn(
                    'group flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-3',
                    'cursor-pointer transition-all',
                    'hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <span className="text-sm font-medium leading-snug group-hover:underline group-hover:underline-offset-4">
                    {thread.subject}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">
                      {formatConversationStatusLabel(thread.status)}
                    </Badge>
                    <ChevronRight
                      className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
