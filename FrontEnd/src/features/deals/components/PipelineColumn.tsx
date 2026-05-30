import { Badge } from '@/components/ui/display/badge'
import type { DealResponse } from '@/features/deals/types'

import { PipelineDealCard } from './PipelineDealCard'

type PipelineColumnProps = {
  label: string
  deals: DealResponse[]
  onDealClick?: (deal: DealResponse) => void
}

/** One kanban column: stage header + deal cards. */
export function PipelineColumn({
  label,
  deals,
  onDealClick,
}: PipelineColumnProps) {
  return (
    <section
      className="flex w-[220px] shrink-0 flex-col rounded-lg bg-muted/30 p-3"
      aria-label={`${label} deals`}
    >
      {/* Column header: stage label + deal count */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{label}</h2>
        <Badge variant="secondary">{deals.length}</Badge>
      </div>

      {/* Deal cards for this stage */}
      {deals.length === 0 ? (
        <p className="text-muted-foreground text-xs">No deals</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deals.map((deal) => (
            <li key={deal.id}>
              <PipelineDealCard
                deal={deal}
                onClick={
                  onDealClick ? () => onDealClick(deal) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
