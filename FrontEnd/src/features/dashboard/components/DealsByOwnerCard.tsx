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
import type { DealOwnerCount } from '@/features/dashboard/types'

type DealsByOwnerCardProps = {
  items: DealOwnerCount[]
}

function formatOwnerLabel(item: DealOwnerCount): string {
  if (item.ownerId === null) return 'Unassigned'
  return item.ownerFullName ?? 'Unknown'
}

/** Deals grouped by owner (wireframe right column). */
export function DealsByOwnerCard({ items }: DealsByOwnerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deals by Owner</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No deals yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.ownerId ?? 'unassigned'}>
                  <TableCell>{formatOwnerLabel(item)}</TableCell>
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
