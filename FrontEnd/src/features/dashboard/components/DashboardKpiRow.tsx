import { KpiCard } from '@/features/dashboard/components/KpiCard'
import { getDashboardKpis } from '@/features/dashboard/lib/metrics'
import type { DashboardResponse } from '@/features/dashboard/types'

type DashboardKpiRowProps = {
  /** Full GET /api/dashboard payload — KPIs derived via metrics.ts. */
  summary: DashboardResponse
}

/** Top row: Open Chats, Unassigned, Active Deals, Won Deals. */
export function DashboardKpiRow({ summary }: DashboardKpiRowProps) {
  const kpis = getDashboardKpis(summary)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard title="Open Chats" value={kpis.openChats} />
      <KpiCard title="Unassigned" value={kpis.unassignedConversations} />
      <KpiCard title="Active Deals" value={kpis.activeDeals} />
      <KpiCard title="Won Deals" value={kpis.wonDeals} />
    </div>
  )
}
