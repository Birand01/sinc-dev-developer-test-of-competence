export type UpdateDealOwnerFailureReason =
  | 'DEAL_NOT_FOUND'
  | 'FORBIDDEN'
  | 'SALES_MUST_CLAIM_SELF'
  | 'OWNER_NOT_FOUND'
  | 'OWNER_NOT_SALES';

/** Application failure for deal owner reassignment use-case; Crm.Api maps reason → HTTP status. */
export class UpdateDealOwnerError extends Error {
  constructor(
    public readonly reason: UpdateDealOwnerFailureReason,
    message: string,
  ) {
    super(message);
    this.name = 'UpdateDealOwnerError';
  }
}

/** Factory for deal owner update failures (keeps service focused on business flow). */
const UPDATE_DEAL_OWNER_ERROR_MESSAGES: Record<UpdateDealOwnerFailureReason, string> = {
  DEAL_NOT_FOUND: 'Deal not found',
  FORBIDDEN: 'Not allowed to reassign this deal owner',
  SALES_MUST_CLAIM_SELF: 'Sales can only claim unassigned deals for themselves',
  OWNER_NOT_FOUND: 'Owner profile not found',
  OWNER_NOT_SALES: 'Owner must be a sales profile',
};

export function updateDealOwnerError(
  reason: UpdateDealOwnerFailureReason,
  message?: string,
): UpdateDealOwnerError {
  return new UpdateDealOwnerError(reason, message ?? UPDATE_DEAL_OWNER_ERROR_MESSAGES[reason]);
}
