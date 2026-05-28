export type CreateDealFailureReason =
  | 'FORBIDDEN'
  | 'CLIENT_NOT_FOUND'
  | 'OWNER_NOT_FOUND'
  | 'OWNER_NOT_SALES';

/** Application failure for deal creation use-case; Crm.Api maps reason → HTTP status. */
export class CreateDealError extends Error {
  constructor(
    public readonly reason: CreateDealFailureReason,
    message: string,
  ) {
    super(message);
    this.name = 'CreateDealError';
  }
}

/** Factory for deal creation failures (keeps service focused on business flow). */
const CREATE_DEAL_ERROR_MESSAGES: Record<CreateDealFailureReason, string> = {
  FORBIDDEN: 'Not allowed to create deals',
  CLIENT_NOT_FOUND: 'Client not found',
  OWNER_NOT_FOUND: 'Owner profile not found',
  OWNER_NOT_SALES: 'Owner must be a sales user',
};

export function createDealError(
  reason: CreateDealFailureReason,
  message?: string,
): CreateDealError {
  return new CreateDealError(reason, message ?? CREATE_DEAL_ERROR_MESSAGES[reason]);
}
