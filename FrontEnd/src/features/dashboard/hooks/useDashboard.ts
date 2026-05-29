import { useQuery } from '@tanstack/react-query'

import { getDashboard } from '@/features/dashboard/api/getDashboard'
import { dashboardQueryKeys } from '@/features/dashboard/lib/queryKeys'
import { useAuth } from '@/features/auth/context/AuthContext'

/**
 * Dashboard aggregates for manager/sales (GET /api/dashboard).
 *
 * Runs only when Supabase session exists — same gate as useMe.
 * UI (DashboardPage) consumes data / isLoading / isError in a later step.
 */
export function useDashboard() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  return useQuery({
    queryKey: dashboardQueryKeys.summary,
    queryFn: getDashboard,
    enabled: isAuthenticated && !isAuthLoading,
  })
}
