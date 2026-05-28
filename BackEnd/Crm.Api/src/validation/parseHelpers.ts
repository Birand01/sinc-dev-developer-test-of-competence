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
