import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppRole } from '@/features/auth/types'
import { useMe } from '@/features/auth/hooks/useMe'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { PipelineBoard } from '@/features/deals/components/PipelineBoard'
import {
  PipelineToolbar,
  pipelineOwnerFilterAll,
  pipelineOwnerFilterMine,
  pipelineOwnerFilterUnassigned,
} from '@/features/deals/components/PipelineToolbar'
import { useDeals } from '@/features/deals/hooks/useDeals'
import type { DealResponse, ListDealsParams } from '@/features/deals/types'
import { ApiError } from '@/lib/apiClient'

function filterDealsForOwnerScope(
  deals: DealResponse[],
  ownerFilter: string,
  salesUserId: string | undefined,
): DealResponse[] {
  // Sales "Unassigned" / "All" — client-side slice; API has no ownerId=null filter.
  if (ownerFilter === pipelineOwnerFilterUnassigned) {
    return deals.filter((deal) => deal.ownerId === null)
  }
  if (ownerFilter === pipelineOwnerFilterMine && salesUserId) {
    return deals.filter((deal) => deal.ownerId === salesUserId)
  }
  return deals
}

/** Pipeline kanban — GET /api/deals with optional owner and search filters. */
export function PipelinePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState(pipelineOwnerFilterAll)

  const { data: me } = useMe()
  const isSales = me?.role === AppRole.Sales

  const trimmedSearch = search.trim()

  // Build GET /api/deals query; sales Mine sends ?ownerId=, Unassigned filtered in UI.
  const listParams = useMemo((): ListDealsParams => {
    const params: ListDealsParams = {}
    if (trimmedSearch) params.q = trimmedSearch

    if (isSales) {
      if (ownerFilter === pipelineOwnerFilterMine && me?.id) {
        params.ownerId = me.id
      }
      return params
    }

    if (ownerFilter !== pipelineOwnerFilterAll) {
      params.ownerId = ownerFilter
    }
    return params
  }, [trimmedSearch, ownerFilter, isSales, me?.id])

  const { data: dashboard } = useDashboard()
  const managerOwnerOptions = useMemo(
    () =>
      (dashboard?.dealsByOwner ?? [])
        .filter((item) => item.ownerId !== null)
        .map((item) => ({
          id: item.ownerId as string,
          label: item.ownerFullName ?? 'Unknown',
        })),
    [dashboard],
  )

  const { data: fetchedDeals, isLoading, isError, error } = useDeals({
    params: listParams,
  })

  const deals = useMemo(() => {
    if (!fetchedDeals) return undefined
    if (!isSales) return fetchedDeals
    if (ownerFilter === pipelineOwnerFilterMine) return fetchedDeals
    // All / Unassigned — apply sales scope on top of RLS result.
    return filterDealsForOwnerScope(fetchedDeals, ownerFilter, me?.id)
  }, [fetchedDeals, isSales, ownerFilter, me?.id])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <PipelineToolbar
          search={search}
          onSearchChange={setSearch}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={setOwnerFilter}
          variant={isSales ? 'sales' : 'manager'}
          managerOwnerOptions={managerOwnerOptions}
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

      {!isLoading && !isError && deals ? (
        deals.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No deals match these filters.
          </p>
        ) : (
          <PipelineBoard
            deals={deals}
            onDealClick={(deal) => navigate(`/deals/${deal.id}`)}
          />
        )
      ) : null}
    </div>
  )
}
