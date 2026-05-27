/**
 * Central HTTP status constants for API layer.
 * Avoids magic numbers in route handlers and error mappings.
 */
export const HttpStatus = {
  Ok: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
  InternalServerError: 500,
} as const;

