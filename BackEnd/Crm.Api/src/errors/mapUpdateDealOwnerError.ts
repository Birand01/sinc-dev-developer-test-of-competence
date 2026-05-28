import type { UpdateDealOwnerError } from '../../../Crm.Application/src/errors/updateDealOwnerError';
import { HttpStatus } from '../http/HttpStatus';
import { ApiError } from './ApiError';

/** Maps deal owner reassignment failures to HTTP-facing ApiError. */
export function mapUpdateDealOwnerError(err: UpdateDealOwnerError): ApiError {
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
      throw new Error(`Unhandled update deal owner reason: ${exhaustive}`);
    }
  }
}
