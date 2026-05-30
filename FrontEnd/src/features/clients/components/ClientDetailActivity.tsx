import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import type { ClientActivityItem } from '@/features/clients/types'

type ClientDetailActivityProps = {
  items: ClientActivityItem[]
}

function formatActivityTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/** Splits "Message: …" / "Deal note: …" — bold prefix from backend summary. */
function ActivitySummary({ summary }: { summary: string }) {
  const separator = summary.indexOf(': ')
  if (separator === -1) {
    return <span className="text-sm">{summary}</span>
  }

  const label = summary.slice(0, separator + 1)
  const body = summary.slice(separator + 2)

  return (
    <p className="text-sm">
      <span className="font-semibold">{label}</span>
      {body ? ` ${body}` : null}
    </p>
  )
}

/** Activity feed for one client (GET /api/clients/:clientId recentActivity). */
export function ClientDetailActivity({ items }: ClientDetailActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item, index) => (
              <li
                key={`${item.type}-${item.occurredAt}-${index}`}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <ActivitySummary summary={item.summary} />
                <time
                  className="text-muted-foreground shrink-0 text-xs"
                  dateTime={item.occurredAt}
                >
                  {formatActivityTime(item.occurredAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
