import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import { Badge } from '@/components/ui/display/badge'
import type { DealResponse } from '@/features/clients/types'

type ClientDealsCardProps = {
  items: DealResponse[]
}

function formatStageLabel(stage: DealResponse['stage']): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Deals for one client (GET /api/clients/:clientId). */
export function ClientDealsCard({ items }: ClientDealsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deals</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No deals yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((deal) => (
              <li
                key={deal.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm">{deal.title}</span>
                <Badge variant="outline">{formatStageLabel(deal.stage)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
