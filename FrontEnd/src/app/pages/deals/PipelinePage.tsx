import { useMemo, useState } from 'react'

import { PipelineBoard } from '@/features/deals/components/PipelineBoard'
import {
  PipelineToolbar,
  pipelineOwnerFilterAll,
} from '@/features/deals/components/PipelineToolbar'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { ListDealsParams } from '@/features/deals/types'
import { ApiError } from '@/lib/apiClient'

/** Pipeline kanban — GET /api/deals with optional owner and search filters. */
export function PipelinePage() {
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState(pipelineOwnerFilterAll)

  const trimmedSearch = search.trim()
  const listParams = useMemo((): ListDealsParams => {
    const params: ListDealsParams = {}
    if (trimmedSearch) params.q = trimmedSearch
    if (ownerFilter !== pipelineOwnerFilterAll) params.ownerId = ownerFilter
    return params
  }, [trimmedSearch, ownerFilter])

  const { data: dashboard } = useDashboard()
  const ownerOptions = useMemo(
    () =>
      (dashboard?.dealsByOwner ?? [])
        .filter((item) => item.ownerId !== null)
        .map((item) => ({
          id: item.ownerId as string,
          label: item.ownerFullName ?? 'Unknown',
        })),
    [dashboard],
  )

  const { data, isLoading, isError, error } = useDeals({ params: listParams })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <PipelineToolbar
          search={search}
          onSearchChange={setSearch}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={setOwnerFilter}
          ownerOptions={ownerOptions}
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm" role="status">
          Loading deals…
        </p>
      ) : null}

      {isError ? (
        <p className="text-destructive text-sm" role="alert">
          {error instanceof ApiError ? error.message : 'Could not load deals'}
        </p>
      ) : null}

      {!isLoading && !isError && data ? (
        data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No deals match these filters.
          </p>
        ) : (
          <PipelineBoard deals={data} />
        )
      ) : null}
    </div>
  )
}
