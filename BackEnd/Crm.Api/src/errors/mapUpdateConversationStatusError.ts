import type { UpdateConversationStatusError } from '../../../Crm.Application/src/errors/updateConversationStatusError';
import { ApiError } from './ApiError';
import { HttpStatus } from '../http/HttpStatus';

/** Maps status update use-case failures to HTTP-facing ApiError. */
export function mapUpdateConversationStatusError(err: UpdateConversationStatusError): ApiError {
  switch (err.reason) {
    case 'THREAD_NOT_FOUND':
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
    case 'INVALID_STATUS':
      return new ApiError({
        code: 'VALIDATION_FAILED',
        status: HttpStatus.BadRequest,
        message: err.message,
      });
  }
}
