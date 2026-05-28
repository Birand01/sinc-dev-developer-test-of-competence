import { z } from 'zod';
import { DealStage } from '../../../Crm.Domain/enums/DealStage';

const nullableTrimmedString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

const nullableTrimmedUuid = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  })
  .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
    message: 'Expected a valid UUID',
  });

const requiredTrimmedString = z.string().trim().min(1);

/** Body schema for POST /api/deals. */
export const createDealBodySchema = z.object({
  clientId: requiredTrimmedString,
  title: requiredTrimmedString,
  ownerId: nullableTrimmedString,
  expectedIntake: nullableTrimmedString,
  valueAmount: z.union([z.number(), z.null(), z.undefined()]).transform((v) => v ?? null),
  valueCurrency: nullableTrimmedString,
});

/** Query schema for GET /api/deals. */
export const listDealsQuerySchema = z.object({
  stage: z
    .union([z.enum(Object.values(DealStage) as [string, ...string[]]), z.undefined()])
    .optional(),
  ownerId: nullableTrimmedString.optional(),
  clientId: nullableTrimmedString.optional(),
  q: nullableTrimmedString.optional(),
});

/** Body schema for PATCH /api/deals/:dealId/stage. */
export const updateDealStageBodySchema = z.object({
  stage: z.enum(Object.values(DealStage) as [string, ...string[]]),
  lostReason: nullableTrimmedString,
});

/** Body schema for PATCH /api/deals/:dealId/owner. */
export const updateDealOwnerBodySchema = z.object({
  ownerId: nullableTrimmedUuid,
});

export type CreateDealBody = z.infer<typeof createDealBodySchema>;
export type ListDealsQuery = z.infer<typeof listDealsQuerySchema>;
export type UpdateDealStageBody = z.infer<typeof updateDealStageBodySchema>;
export type UpdateDealOwnerBody = z.infer<typeof updateDealOwnerBodySchema>;
