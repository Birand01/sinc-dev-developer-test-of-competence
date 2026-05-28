import type { CreateDealNoteError } from '../../../Crm.Application/src/errors/createDealNoteError';
import { HttpStatus } from '../http/HttpStatus';
import { ApiError } from './ApiError';

/** Maps deal note creation use-case failures to HTTP-facing ApiError. */
export function mapCreateDealNoteError(err: CreateDealNoteError): ApiError {
  switch (err.reason) {
    case 'DEAL_NOT_FOUND':
      return new ApiError({
        code: 'NOT_FOUND',
        status: HttpStatus.NotFound,
        message: err.message,
      });
    case 'FORBIDDEN':
      return new ApiError({
        code: 'FORBIDDEN',
        status: HttpStatus.Forbidden,
        message: err.message,
      });
    case 'BODY_REQUIRED':
      return new ApiError({
        code: 'VALIDATION_FAILED',
        status: HttpStatus.BadRequest,
        message: err.message,
      });
    default: {
      const exhaustive: never = err.reason;
      throw new Error(`Unhandled create deal note reason: ${exhaustive}`);
    }
  }
}
