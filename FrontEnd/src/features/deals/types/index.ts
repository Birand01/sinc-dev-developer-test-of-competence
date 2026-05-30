/**
 * Types for Deal API JSON (Worker → browser).
 *
 * Source of truth: BackEnd Crm.Api dealResponseMapper + dealsSchemas.ts.
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
