import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import { DealStage } from '@/features/dashboard/types'
import type { DealStageHistoryEntry } from '@/features/deals/types'

type DealStageHistoryCardProps = {
  /** From GET /api/deals/:dealId → stageHistory[]. */
  items: DealStageHistoryEntry[]
  /** From deal.lostReason — history rows do not store reason text. */
  lostReason?: string | null
}

// --- Display helpers ---

function formatStageLabel(stage: DealStageHistoryEntry['toStage']): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatTransition(entry: DealStageHistoryEntry): string {
  const to = formatStageLabel(entry.toStage)
  if (entry.fromStage == null) return to
  return `${formatStageLabel(entry.fromStage)} → ${to}`
}

function formatHistoryDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/**
 * Deal detail — stage history column (wireframe right card).
 * Shows transitions oldest → newest; lostReason on rows that end in lost.
 */
export function DealStageHistoryCard({
  items,
  lostReason,
}: DealStageHistoryCardProps) {
  const history = [...items].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage history</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm">No stage changes yet.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((entry) => {
              const showLostReason =
                entry.toStage === DealStage.Lost &&
                lostReason != null &&
                lostReason.trim() !== ''

              return (
                <li key={entry.id} className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {formatTransition(entry)}
                  </p>
                  {showLostReason ? (
                    <p className="text-muted-foreground text-sm">
                      {lostReason.trim()}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground text-xs">
                    {formatHistoryDate(entry.createdAt)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
