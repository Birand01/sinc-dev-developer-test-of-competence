import type { MeResponse } from '@/features/auth/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Fetch the signed-in user's CRM profile from the Worker.
 *
 * Requires a Supabase JWT (apiClient attaches Authorization: Bearer).
 * 401 — missing/invalid token; 404 — auth ok but no profiles row (see seed).
 */
export function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/api/me')
}
