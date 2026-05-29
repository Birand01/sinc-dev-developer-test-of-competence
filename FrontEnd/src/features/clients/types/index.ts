/**
 * Types for Client API JSON (Worker → browser).
 *
 * Source of truth: BackEnd Crm.Api clientResponseMapper + routes/clients.ts.
 */

/** Single row from GET /api/clients (200). */
export type ClientResponse = {
  id: string
  /** profiles.id when client has login; null for lead-only records */
  profileId: string | null
  fullName: string
  email: string | null
  phone: string | null
  country: string | null
  targetCountry: string | null
  /** profiles.id of sales/manager who created the record */
  createdBy: string | null
  createdAt: string
  updatedAt: string
  /** Newest open pipeline deal title; null when none (GET /api/clients). */
  activeDealTitle: string | null
}

/** GET /api/clients returns a JSON array of clients. */
export type ClientsListResponse = ClientResponse[]

/** Optional query params for GET /api/clients (?q=&ownerId=). */
export type ListClientsParams = {
  q?: string
  ownerId?: string
}
