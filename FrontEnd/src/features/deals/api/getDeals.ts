import type { DealsListResponse, ListDealsParams } from '@/features/deals/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Fetch CRM deals from the Worker (GET /api/deals).
 *
 * Pure HTTP — no React Query here. useDeals pairs this with dealsQueryKeys.list(params).
 * Optional filters: ?stage= ?ownerId= ?clientId= ?q= title search.
 */
export function getDeals(params: ListDealsParams = {}): Promise<DealsListResponse> {
  const search = new URLSearchParams()
  if (params.stage) search.set('stage', params.stage)
  if (params.ownerId?.trim()) search.set('ownerId', params.ownerId.trim())
  if (params.clientId?.trim()) search.set('clientId', params.clientId.trim())
  if (params.q?.trim()) search.set('q', params.q.trim())

  const query = search.toString()
  const path = query ? `/api/deals?${query}` : '/api/deals'

  return apiFetch<DealsListResponse>(path)
}
