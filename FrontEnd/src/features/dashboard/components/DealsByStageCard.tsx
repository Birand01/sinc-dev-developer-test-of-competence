import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data/table'
import type { DealStageCount } from '@/features/dashboard/types'

type DealsByStageCardProps = {
  items: DealStageCount[]
}

/** Human-readable pipeline stage label for the table. */
function formatStageLabel(stage: DealStageCount['stage']): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Deals grouped by pipeline stage (wireframe left column). */
export function DealsByStageCard({ items }: DealsByStageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deals by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No deals yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.stage}>
                  <TableCell>{formatStageLabel(item.stage)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
