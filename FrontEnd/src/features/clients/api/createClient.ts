import type {
  ClientDetailClientResponse,
  CreateClientBody,
} from '@/features/clients/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Create a CRM client / lead (POST /api/clients).
 *
 * Sales and manager only — Worker enforces canCreateClient. createdBy comes from JWT.
 * Requires JWT. 201 — created client; 400/403 — validation or role rules.
 */
export function createClient(
  body: CreateClientBody,
): Promise<ClientDetailClientResponse> {
  return apiFetch<ClientDetailClientResponse>('/api/clients', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
