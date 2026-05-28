import type { UpdateDealStageError } from '../../../Crm.Application/src/errors/updateDealStageError';
import { HttpStatus } from '../http/HttpStatus';
import { ApiError } from './ApiError';

/** Maps deal stage update use-case failures to HTTP-facing ApiError. */
export function mapUpdateDealStageError(err: UpdateDealStageError): ApiError {
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
    case 'LOST_REASON_REQUIRED':
      return new ApiError({
        code: 'VALIDATION_FAILED',
        status: HttpStatus.BadRequest,
        message: err.message,
      });
    default: {
      const exhaustive: never = err.reason;
      throw new Error(`Unhandled update deal stage reason: ${exhaustive}`);
    }
  }
}
