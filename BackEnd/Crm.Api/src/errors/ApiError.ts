import type { ErrorCode } from './ErrorCode';

export type ApiErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: ApiErrorDetails;

  constructor(params: {
    code: ErrorCode;
    status: number;
    message: string;
    details?: ApiErrorDetails;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
  }
}

