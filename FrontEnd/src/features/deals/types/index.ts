/**
 * Types for Deal API JSON (Worker → browser).
 *
 * Source of truth: BackEnd Crm.Api dealResponseMapper, dealsSchemas.ts, routes/deals.ts.
 */

import type { DealStage } from '@/features/dashboard/types'

// --- Mutations (POST / PATCH bodies) ---

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

/** Body for PATCH /api/deals/:dealId/stage (updateDealStageBodySchema). */
export type UpdateDealStageBody = {
  stage: DealStage
  /** Required when stage is lost; omit or null otherwise. */
  lostReason?: string | null
}

/** Body for POST /api/deals/:dealId/notes (createDealNoteBodySchema). */
export type CreateDealNoteBody = {
  body: string
}

// --- Single deal resource (toDealResponse) ---

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

// --- Pipeline list (GET /api/deals) ---

/** GET /api/deals (200) — array body; cached under dealsQueryKeys.list(params). */
export type DealsListResponse = DealResponse[]

/** Query string for GET /api/deals; each distinct params object gets its own React Query cache key. */
export type ListDealsParams = {
  stage?: DealStage
  ownerId?: string
  clientId?: string
  q?: string
}

// --- Deal detail (GET /api/deals/:dealId) ---

/** Client row embedded in GET /api/deals/:dealId (toDealDetailResponse.client). */
export type DealClientSummary = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  country: string | null
  targetCountry: string | null
}

/** Single note from GET /api/deals/:dealId (toDealNoteResponse). */
export type DealNoteResponse = {
  id: string
  dealId: string
  /** profiles.id of author */
  authorId: string
  body: string
  createdAt: string
}

/** Stage transition row from GET /api/deals/:dealId (stageHistory item). */
export type DealStageHistoryEntry = {
  id: string
  dealId: string
  fromStage: DealStage | null
  toStage: DealStage
  /** profiles.id of user who changed stage */
  changedBy: string
  createdAt: string
}

/** JSON body for GET /api/deals/:dealId (200); cached under dealsQueryKeys.detail(dealId). */
export type DealDetailResponse = {
  deal: DealResponse
  client: DealClientSummary
  notes: DealNoteResponse[]
  stageHistory: DealStageHistoryEntry[]
}
