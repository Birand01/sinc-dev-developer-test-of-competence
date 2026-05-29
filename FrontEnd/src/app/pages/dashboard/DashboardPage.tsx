import { DashboardKpiRow } from '@/features/dashboard/components/DashboardKpiRow'
import { DealsByOwnerCard } from '@/features/dashboard/components/DealsByOwnerCard'
import { DealsByStageCard } from '@/features/dashboard/components/DealsByStageCard'
import { RecentActivityCard } from '@/features/dashboard/components/RecentActivityCard'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { ApiError } from '@/lib/apiClient'

/** CRM dashboard — fetches GET /api/dashboard and renders feature components. */
export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard()

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm" role="status">
          Loading dashboard…
        </p>
      </div>
    )
  }

  if (isError || !data) {
    const message =
      error instanceof ApiError ? error.message : 'Could not load dashboard'
    return (
      <div className="p-6">
        <p className="text-destructive text-sm" role="alert">
          {message}
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          Check Worker is running. Client role gets 403 on this endpoint.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <DashboardKpiRow summary={data} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DealsByStageCard items={data.dealsByStage} />
        <DealsByOwnerCard items={data.dealsByOwner} />
      </div>
      <RecentActivityCard items={data.recentActivity} />
    </div>
  )
}
