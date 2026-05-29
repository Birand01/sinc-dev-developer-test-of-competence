import { z } from 'zod';

/**
 * URL path parameter schemas (used with parseParamsOrThrow in routes).
 *
 * Quick reference:
 * - pathSchemas        = URL id rules (what format is allowed)
 * - parseParamsOrThrow = apply rules; invalid → 400 VALIDATION_FAILED
 * - Application service = business logic after validation (404/403 live there)
 *
 * Reading z.object({ ... }):
 * - z.object({ ... })  → expect an object with these fields
 * - clientId:          → field name (must match route param :clientId)
 * - z.string()         → value must be a string
 * - .uuid()            → string must be valid UUID format
 *
 * Examples for clientIdParamSchema:
 * - { clientId: "8326ef2b-11cd-4096-8c01-44974b2520d7" } → pass → service runs
 * - { clientId: "abc" }                                 → fail → 400 (not a uuid)
 * - { clientId: 123 }                                   → fail → 400 (not a string)
 * - { clientId: "" }                                    → fail → 400
 * - {}                                                  → fail → 400 (clientId missing)
 */

/** Path params for routes under /api/clients/:clientId. */
export const clientIdParamSchema = z.object({
  clientId: z.string().uuid(),
});

/**
 * Path params for routes under /api/deals/:dealId.
 * Same rules as clientIdParamSchema; only the field name differs (dealId).
 */
export const dealIdParamSchema = z.object({
  dealId: z.string().uuid(),
});

/**
 * Path params for routes under /api/conversations/:threadId.
 * Same rules as clientIdParamSchema; only the field name differs (threadId).
 */
export const threadIdParamSchema = z.object({
  threadId: z.string().uuid(),
});
