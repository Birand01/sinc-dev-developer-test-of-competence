import { z } from 'zod';
import { DealStage } from '../../../Crm.Domain/enums/DealStage';
import {
  nullableTrimmedString,
  nullableTrimmedUuid,
  requiredTrimmedString,
  requiredTrimmedUuid,
} from './commonSchemas';

/** Body schema for POST /api/deals. */
export const createDealBodySchema = z.object({
  clientId: requiredTrimmedUuid,
  title: requiredTrimmedString,
  ownerId: nullableTrimmedUuid.optional().default(null),
  expectedIntake: nullableTrimmedString.optional().default(null),
  valueAmount: z
    .union([z.number(), z.null()])
    .optional()
    .default(null),
  valueCurrency: nullableTrimmedString.optional().default(null),
});

/** Query schema for GET /api/deals. */
export const listDealsQuerySchema = z.object({
  stage: z
    .union([z.enum(Object.values(DealStage) as [string, ...string[]]), z.undefined()])
    .optional(),
  ownerId: nullableTrimmedUuid.optional(),
  clientId: nullableTrimmedUuid.optional(),
  q: nullableTrimmedString.optional(),
});

/** Body schema for PATCH /api/deals/:dealId/stage. */
export const updateDealStageBodySchema = z.object({
  stage: z.enum(Object.values(DealStage) as [string, ...string[]]),
  lostReason: nullableTrimmedString.optional().default(null),
});

/** Body schema for PATCH /api/deals/:dealId/owner. */
export const updateDealOwnerBodySchema = z.object({
  ownerId: nullableTrimmedUuid,
});

/** Body schema for POST /api/deals/:dealId/notes. */
export const createDealNoteBodySchema = z.object({
  body: requiredTrimmedString,
});

export type CreateDealBody = z.infer<typeof createDealBodySchema>;
export type ListDealsQuery = z.infer<typeof listDealsQuerySchema>;
export type UpdateDealStageBody = z.infer<typeof updateDealStageBodySchema>;
export type UpdateDealOwnerBody = z.infer<typeof updateDealOwnerBodySchema>;
export type CreateDealNoteBody = z.infer<typeof createDealNoteBodySchema>;
