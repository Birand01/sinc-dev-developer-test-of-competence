import { useMemo } from 'react'

import { useDashboard } from '@/features/dashboard/hooks/useDashboard'

/** Sales rep option for manager owner reassign Select (from dashboard dealsByOwner). */
export type SalesRepOption = {
  id: string
  label: string
}

/**
 * Sales reps with at least one visible deal — sourced from GET /api/dashboard dealsByOwner.
 * Used by manager owner reassign UI (B-16); same rep list as pipeline owner filter.
 *
 * Note: reps with zero deals are omitted until a dedicated profiles API exists.
 */
export function useSalesRepOptions() {
  const { data: dashboard, isLoading, isError, error } = useDashboard()

  const options = useMemo((): SalesRepOption[] => {
    return (dashboard?.dealsByOwner ?? [])
      .filter((item) => item.ownerId !== null)
      .map((item) => ({
        id: item.ownerId as string,
        label: item.ownerFullName ?? 'Unknown',
      }))
  }, [dashboard])

  return { options, isLoading, isError, error }
}
