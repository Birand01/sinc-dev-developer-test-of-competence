import type { DealResponse, UpdateDealStageBody } from '@/features/deals/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Update deal pipeline stage (PATCH /api/deals/:dealId/stage).
 *
 * Pure HTTP — no React Query here. useUpdateDealStage pairs this with invalidation.
 * Requires JWT. 200 — updated deal; 403 — sales on non-owned deal; 400 — lost without reason.
 */
export function updateDealStage(
  dealId: string,
  body: UpdateDealStageBody,
): Promise<DealResponse> {
  return apiFetch<DealResponse>(
    `/api/deals/${encodeURIComponent(dealId)}/stage`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
}
