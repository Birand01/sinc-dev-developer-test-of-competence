import type { CreateDealBody, DealResponse } from '@/features/deals/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Create a deal for a client (POST /api/deals).
 *
 * Requires JWT. 201 — created deal; 400/403/404 — validation or business rules.
 */
export function createDeal(body: CreateDealBody): Promise<DealResponse> {
  return apiFetch<DealResponse>('/api/deals', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
