import type { CreateDealError } from '../../../Crm.Application/src/errors/createDealError';
import { HttpStatus } from '../http/HttpStatus';
import { ApiError } from './ApiError';

/** Maps deal creation use-case failures to HTTP-facing ApiError. */
export function mapCreateDealError(err: CreateDealError): ApiError {
  switch (err.reason) {
    case 'FORBIDDEN':
      return new ApiError({
        code: 'FORBIDDEN',
        status: HttpStatus.Forbidden,
        message: err.message,
      });
    case 'CLIENT_NOT_FOUND':
      return new ApiError({
        code: 'NOT_FOUND_CLIENT',
        status: HttpStatus.NotFound,
        message: err.message,
      });
    case 'OWNER_NOT_FOUND':
      return new ApiError({
        code: 'NOT_FOUND',
        status: HttpStatus.NotFound,
        message: err.message,
      });
    case 'OWNER_NOT_SALES':
      return new ApiError({
        code: 'VALIDATION_FAILED',
        status: HttpStatus.BadRequest,
        message: err.message,
      });
    default: {
      const exhaustive: never = err.reason;
      throw new Error(`Unhandled create deal reason: ${exhaustive}`);
    }
  }
}
