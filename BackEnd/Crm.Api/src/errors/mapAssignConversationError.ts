import type { AssignConversationError } from '../../../Crm.Application/src/errors/assignConversationError';
import { ApiError } from './ApiError';
import { HttpStatus } from '../http/HttpStatus';

/** Maps assign use-case failures to HTTP-facing ApiError (single place for status codes). */
export function mapAssignConversationError(err: AssignConversationError): ApiError {
  switch (err.reason) {
    case 'THREAD_NOT_FOUND':
    case 'ASSIGNEE_NOT_FOUND':
      return new ApiError({
        code: 'NOT_FOUND',
        status: HttpStatus.NotFound,
        message: err.message,
      });
    case 'FORBIDDEN':
    case 'SALES_MUST_CLAIM_SELF':
      return new ApiError({
        code: 'FORBIDDEN',
        status: HttpStatus.Forbidden,
        message: err.message,
      });
    case 'ASSIGNEE_NOT_SALES':
      return new ApiError({
        code: 'VALIDATION_FAILED',
        status: HttpStatus.BadRequest,
        message: err.message,
      });
  }
}
