import type { DealResponse, UpdateDealOwnerBody } from '@/features/deals/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Update deal ownership (PATCH /api/deals/:dealId/owner).
 *
 * Pure HTTP — no React Query here. useClaimDeal / manager reassign hooks pair this with invalidation.
 * Requires JWT. 200 — updated deal; 403 — sales claim forbidden; sales must send own ownerId.
 */
export function updateDealOwner(
  dealId: string,
  body: UpdateDealOwnerBody,
): Promise<DealResponse> {
  return apiFetch<DealResponse>(
    // encodeURIComponent: safe path segment if dealId ever contains / ? # or spaces (UUIDs unchanged).
    `/api/deals/${encodeURIComponent(dealId)}/owner`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
}
