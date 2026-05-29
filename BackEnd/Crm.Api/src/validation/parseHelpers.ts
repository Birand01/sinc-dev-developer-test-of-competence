import type { z } from 'zod';
import { ApiError } from '../errors';
import { HttpStatus } from '../http/HttpStatus';

function parseOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown,
  message: string,
): z.infer<TSchema> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message,
      details: { issues: parsed.error.issues },
    });
  }
  return parsed.data;
}

/** Parse and validate request body using a Zod schema. */
export function parseBodyOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  body: unknown,
  message = 'Invalid request body',
): z.infer<TSchema> {
  return parseOrThrow(schema, body, message);
}

/** Parse and validate query params using a Zod schema. */
export function parseQueryOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  query: unknown,
  message = 'Invalid query parameters',
): z.infer<TSchema> {
  return parseOrThrow(schema, query, message);
}

/**
 * Parse and validate URL path params using a Zod schema (e.g. pathSchemas.ts).
 *
 * Flow in routes:
 *   c.req.param('clientId') → build { clientId: "..." } → parseParamsOrThrow(schema, params)
 *   → invalid UUID/format: 400 (never hits service)
 *   → valid UUID: returned field is safe to pass to service (404 only if record missing)
 *
 * Memory hook:
 *   pathSchemas          = URL id rules
 *   parseParamsOrThrow   = apply rules; broken input → 400
 *   Service              = business logic after validation (404/403 here)
 */
export function parseParamsOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  params: unknown,
  message = 'Invalid path parameters',
): z.infer<TSchema> {
  return parseOrThrow(schema, params, message);
}
