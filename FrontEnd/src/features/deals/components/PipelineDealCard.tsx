import {
  Card,
  CardContent,
} from '@/components/ui/display/card'
import { cn } from '@/lib/utils'
import type { DealResponse } from '@/features/deals/types'

type PipelineDealCardProps = {
  deal: DealResponse
  /** Wired on PipelinePage when deal detail route exists. */
  onClick?: () => void
  className?: string
}

function formatValueLine(
  amount: number | null,
  currency: string | null,
): string | null {
  if (amount == null) return null
  const code = currency?.trim()
  return code ? `${code} ${amount.toLocaleString()}` : amount.toLocaleString()
}

/** Single deal tile for the pipeline kanban board (wireframe card per deal). */
export function PipelineDealCard({
  deal,
  onClick,
  className,
}: PipelineDealCardProps) {
  const valueLine = formatValueLine(deal.valueAmount, deal.valueCurrency)
  const isInteractive = Boolean(onClick)

  return (
    <Card
      size="sm"
      className={cn(
        isInteractive &&
          'cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <CardContent className="py-3">
        <p className="font-medium leading-snug">{deal.title}</p>
        {deal.expectedIntake ? (
          <p className="text-muted-foreground mt-1 text-xs">
            {deal.expectedIntake}
          </p>
        ) : null}
        {valueLine ? (
          <p className="text-muted-foreground mt-1 text-xs">{valueLine}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
