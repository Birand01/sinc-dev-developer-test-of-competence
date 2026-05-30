import type { DealDetailResponse } from '@/features/deals/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Fetch rich deal detail from the Worker (GET /api/deals/:dealId).
 *
 * Pure HTTP — no React Query here. useDealDetail pairs this with dealsQueryKeys.detail(dealId).
 * Requires JWT. 404 — unknown or inaccessible deal; 401 — missing/invalid token.
 */
export function getDealDetail(dealId: string): Promise<DealDetailResponse> {
  return apiFetch<DealDetailResponse>(
    `/api/deals/${encodeURIComponent(dealId)}`,
  )
}
