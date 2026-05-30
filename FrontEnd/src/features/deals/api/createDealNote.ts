import type { CreateDealNoteBody, DealNoteResponse } from '@/features/deals/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Add an internal note to a deal (POST /api/deals/:dealId/notes).
 *
 * Pure HTTP — no React Query here. useCreateDealNote pairs this with invalidation.
 * Requires JWT. 201 — created note; 403 — sales on non-owned deal; 404 — deal not found.
 */
export function createDealNote(
  dealId: string,
  body: CreateDealNoteBody,
): Promise<DealNoteResponse> {
  return apiFetch<DealNoteResponse>(
    `/api/deals/${encodeURIComponent(dealId)}/notes`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}
