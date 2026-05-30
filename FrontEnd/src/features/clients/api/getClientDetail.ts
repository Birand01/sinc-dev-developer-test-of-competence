import type { ClientDetailResponse } from '@/features/clients/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Fetch rich client detail from the Worker (GET /api/clients/:clientId).
 *
 * Requires JWT. 404 — unknown client; 401 — missing/invalid token.
 */
export function getClientDetail(clientId: string): Promise<ClientDetailResponse> {
  return apiFetch<ClientDetailResponse>(
    `/api/clients/${encodeURIComponent(clientId)}`,
  )
}
