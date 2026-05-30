/**
 * Types for Deal API JSON (Worker → browser).
 *
 * Source of truth: BackEnd Crm.Api dealResponseMapper, dealsSchemas.ts + routes/deals.ts.
 */

import type { DealStage } from '@/features/dashboard/types'

/** Body for POST /api/deals (createDealBodySchema). */
export type CreateDealBody = {
  clientId: string
  title: string
  /** profiles.id of owning sales rep; omit or null when unassigned */
  ownerId?: string | null
  expectedIntake?: string | null
  valueAmount?: number | null
  valueCurrency?: string | null
}

/** JSON body for POST /api/deals (201) and deal resources (toDealResponse). */
export type DealResponse = {
  id: string
  clientId: string
  /** profiles.id of owning sales rep; null when unassigned */
  ownerId: string | null
  title: string
  stage: DealStage
  valueAmount: number | null
  valueCurrency: string | null
  expectedIntake: string | null
  lostReason: string | null
  createdAt: string
  updatedAt: string
}

/** GET /api/deals (200) — array body; cached under dealsQueryKeys.list(params). */
export type DealsListResponse = DealResponse[]

/** Query string for GET /api/deals; each distinct params object gets its own React Query cache key. */
export type ListDealsParams = {
  stage?: DealStage
  ownerId?: string
  clientId?: string
  q?: string
}
