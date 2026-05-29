/**
 * Shared Zod building blocks — NOT full endpoint schemas.
 *
 * Purpose:
 * - Define reusable field rules (trim, required, UUID format) in one place.
 * - Endpoint files import these and compose full schemas:
 *   dealsSchemas.ts, conversationsSchemas.ts, clientsSchemas.ts, pathSchemas.ts
 *
 * Flow:
 *   commonSchemas (field rules) → *Schemas.ts (POST/PATCH body or path shape)
 *   → parseBodyOrThrow / parseParamsOrThrow → route → service
 *
 * Helpers (quick reference + examples):
 *
 * requiredTrimmedString
 *   - Non-empty text after trim (e.g. deal title, note body, client fullName).
 *   - "  hello  " → pass | "" or "   " → fail (400)
 *
 * optionalTrimmedString
 *   - Field may be omitted; if present, trim; blank → treat as omitted.
 *   - omitted → pass | "  +90 555  " → "+90 555" | "   " → undefined (omitted)
 *
 * nullableTrimmedString
 *   - String, null, or omitted; blank string becomes null.
 *   - Used for lostReason, expectedIntake, optional query `q`.
 *
 * requiredTrimmedUuid
 *   - Required id in JSON body; must be valid UUID (Adım 3).
 *   - Used in createDealBodySchema.clientId, createConversationBodySchema.clientId,
 *     assignConversationBodySchema.assignedTo.
 *   - "8326ef2b-11cd-4096-8c01-44974b2520d7" → pass | "abc" → fail (400)
 *
 * nullableTrimmedUuid
 *   - Optional id: UUID, null (unassign), or omitted.
 *   - Used for updateDealOwnerBodySchema.ownerId, createDealBodySchema.ownerId.
 *   - null → pass | "not-uuid" → fail (400)
 *
 * Memory hook:
 *   commonSchemas = LEGO pieces | *Schemas.ts = full form per endpoint
 */
import { z } from 'zod';

export const requiredTrimmedString = z.string().trim().min(1);
export const optionalTrimmedString = z
  .union([z.string(), z.undefined()])
  .transform((value) => {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

export const nullableTrimmedString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

/** Required non-empty string that must be a valid UUID (e.g. POST body clientId). */
export const requiredTrimmedUuid = z
  .string()
  .trim()
  .min(1)
  .refine((value) => z.string().uuid().safeParse(value).success, {
    message: 'Expected a valid UUID',
  });

/** Optional/nullable UUID (e.g. PATCH deal ownerId). */
export const nullableTrimmedUuid = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  })
  .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
    message: 'Expected a valid UUID',
  });
