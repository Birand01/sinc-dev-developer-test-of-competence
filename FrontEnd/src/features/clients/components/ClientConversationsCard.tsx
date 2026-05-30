import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import { Badge } from '@/components/ui/display/badge'
import type { ConversationThreadResponse } from '@/features/clients/types'

type ClientConversationsCardProps = {
  items: ConversationThreadResponse[]
}

function formatStatusLabel(status: ConversationThreadResponse['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

/** Conversation threads for one client (GET /api/clients/:clientId). */
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
          <ul className="divide-y divide-border">
            {items.map((thread) => (
              <li
                key={thread.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm">{thread.subject}</span>
                <Badge variant="outline">{formatStatusLabel(thread.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
