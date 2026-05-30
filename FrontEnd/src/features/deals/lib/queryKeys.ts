import type { ListDealsParams } from '@/features/deals/types'

/**
 * React Query cache keys for deal reads and invalidation targets.
 *
 * queryKey = cache address. React Query stores fetch results per key.
 * Different filters must use different keys so stage/owner/search do not share stale data.
 *
 * - list(params) → Pipeline board (useDeals)
 * - detail(dealId) → Deal detail page (useDealDetail)
 * - allLists → prefix; invalidate after create/stage change so every Pipeline filter refetches
 */
export const dealsQueryKeys = {
  /** Pipeline list fetch; params in the key (stage, ownerId, clientId, q). */
  list: (params: ListDealsParams = {}) => ['deals', 'list', params] as const,
  /** Prefix — matches ['deals', 'list', …] for any params. */
  allLists: ['deals', 'list'] as const,
  /** Deal detail page — GET /api/deals/:dealId (deal, client, notes, stageHistory). */
  detail: (dealId: string) => ['deals', 'detail', dealId] as const,
}
