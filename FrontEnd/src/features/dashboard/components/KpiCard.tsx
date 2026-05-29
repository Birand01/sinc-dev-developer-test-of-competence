import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'

type KpiCardProps = {
  /** Wireframe label, e.g. "Open Chats". */
  title: string
  /** Pre-computed count from lib/metrics.ts. */
  value: number
}

/** Single KPI tile for the dashboard top row. */
export function KpiCard({ title, value }: KpiCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-normal">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}
