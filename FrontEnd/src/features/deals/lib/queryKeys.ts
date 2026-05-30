import type { ListDealsParams } from '@/features/deals/types'

/**
 * React Query cache keys for deal reads (Pipeline / GET /api/deals).
 *
 * queryKey = cache address. React Query stores fetch results per key.
 * Different filters must use different keys so stage/owner/search do not share stale data.
 *
 * - list(params) → used by useDeals queryKey + queryFn (exact match for one filter set)
 * - allLists → prefix only; invalidateQueries refreshes every cached list(params) entry
 *   (e.g. after POST /api/deals from Client Detail so Pipeline shows the new deal)
 */
export const dealsQueryKeys = {
  /** Pipeline list fetch; params in the key (stage, ownerId, clientId, q). */
  list: (params: ListDealsParams = {}) => ['deals', 'list', params] as const,
  /** Prefix — matches ['deals', 'list', …] for any params. */
  allLists: ['deals', 'list'] as const,
}
