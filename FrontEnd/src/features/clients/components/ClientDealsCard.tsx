import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import { Badge } from '@/components/ui/display/badge'
import { cn } from '@/lib/utils'
import type { DealResponse } from '@/features/clients/types'

type ClientDealsCardProps = {
  items: DealResponse[]
}

function formatStageLabel(stage: DealResponse['stage']): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Deals for one client (GET /api/clients/:clientId). Each row is a link tile to deal detail. */
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
          <ul className="space-y-2">
            {items.map((deal) => (
              <li key={deal.id}>
                <Link
                  to={`/deals/${deal.id}`}
                  className={cn(
                    'group flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-3',
                    'cursor-pointer transition-all',
                    'hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <span className="text-sm font-medium leading-snug group-hover:underline group-hover:underline-offset-4">
                    {deal.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">{formatStageLabel(deal.stage)}</Badge>
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
