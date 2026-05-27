/**
 * Central list of API error codes.
 *
 * API layer (Crm.Api) owns HTTP-facing semantics; Application/Domain should
 * only decide "what went wrong" (code), not how HTTP serializes it.
 */
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_JSON'
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'NOT_FOUND_PROFILE'
  | 'NOT_FOUND_CLIENT';

